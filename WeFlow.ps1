[CmdletBinding()]
param(
[string]$Path,
[string]$Backup,
[switch]$Restore,
[switch]$WhatIfOnly
)

$ErrorActionPreference = 'Stop'
if (-not $Path) {
$Path = '.\wcdb_api.dll'
}
if (-not $Backup) { $Backup = Join-Path $PSScriptRoot 'wcdb_api.dll.bak.4.5.0' }

$sigA_old = [byte[]]@(0x48,0x3D,0x7F,0xA2,0xBD,0x6A,0x7E,0x0A,0xB8,0x9B,0xFF,0xFF,0xFF,0x48,0x83,0xC4,0x28,0xC3)
$sigA_new = [byte[]]@(0x48,0x3B,0x05,0x1C,0x00,0x00,0x00,0x7E,0x09,0x6A,0x9B,0x58,0x48,0x83,0xC4,0x28,0xC3,0xCC)
$limit64 = [byte[]]@(0xFF,0x56,0x86,0xF4,0x00,0x00,0x00,0x00) # 4102444799
$caveDelta = 35 # 空洞相对特征串起点
$caveLen = 10
$sigB_old = [byte[]]@(0xC7,0x44,0x24,0x6C,0x7E,0x00,0x00,0x00, 0xC7,0x44,0x24,0x68,0x08,0x00,0x00,0x00, 0xC7,0x44,0x24,0x64,0x1E,0x00,0x00,0x00)
$sigB_new = [byte[]]@(0xC7,0x44,0x24,0x6C,0xC7,0x00,0x00,0x00, 0xC7,0x44,0x24,0x68,0x0B,0x00,0x00,0x00, 0xC7,0x44,0x24,0x64,0x1F,0x00,0x00,0x00)

function Find-Bytes([byte[]]$Hay, [byte[]]$Needle) {
for ($i = 0; $i -le $Hay.Length - $Needle.Length; $i++) {
if ($Hay[$i] -ne $Needle[0]) { continue }
$ok = $true
for ($j = 1; $j -lt $Needle.Length; $j++) { if ($Hay[$i+$j] -ne $Needle[$j]) { $ok = $false; break } }
if ($ok) { return $i }
}
return -1
}

if (-not (Test-Path -LiteralPath $Path)) { throw "找不到 DLL: $Path" }
$bytes = [IO.File]::ReadAllBytes($Path)
Write-Host ("目标: {0}" -f $Path)
Write-Host ("大小: {0} 字节" -f $bytes.Length)

if ($Restore) {
if (-not (Test-Path -LiteralPath $Backup)) { throw "没有备份可还原: $Backup" }
Copy-Item -LiteralPath $Backup -Destination $Path -Force
Write-Host ("已还原原始 DLL: {0} -> {1}" -f $Backup, $Path)
return
}

$out = [byte[]]::new($bytes.Length)
[Array]::Copy($bytes, $out, $bytes.Length)
$didA = $false; $didB = $false; $doneA = $false; $doneB = $false
$atA = Find-Bytes $bytes $sigA_old
$atAnew = Find-Bytes $bytes $sigA_new
if ($atA -ge 0) {
$caveAt = $atA + $caveDelta
for ($i = 0; $i -lt $caveLen; $i++) {
if ($bytes[$caveAt + $i] -ne 0xCC) { throw ("补丁① 的常量空洞不是 int3（0x{0:X}），DLL 布局已变，未做任何修改。" -f ($caveAt + $i)) }
}
[Array]::Copy($sigA_new, 0, $out, $atA, $sigA_new.Length)
[Array]::Copy($limit64, 0, $out, $caveAt, $limit64.Length)
$didA = $true
Write-Host ("补丁①: InitProtection 到期时刻 -> 2099-12-31 23:59:59 UTC (特征串 0x{0:X}, 常量 0x{1:X})" -f $atA, $caveAt)
} elseif ($atAnew -ge 0) {
$doneA = $true
Write-Host "补丁①: 已经是 2099 版本，跳过。"
} else {
Write-Host "补丁①: 未找到特征串，跳过（可能版本不同）。"
}
$atB = Find-Bytes $bytes $sigB_old
$atBnew = Find-Bytes $bytes $sigB_new
if ($atB -ge 0) {
[Array]::Copy($sigB_new, 0, $out, $atB, $sigB_new.Length)
$didB = $true
Write-Host ("补丁②: wcdb_init 的 struct tm 到期日 -> 2099-12-31 23:59:59（本地时区）(特征串 0x{0:X})" -f $atB)
} elseif ($atBnew -ge 0) {
$doneB = $true
Write-Host "补丁②: 已经是 2099 版本，跳过。"
} else {
Write-Host "补丁②: 未找到特征串，跳过（可能版本不同）。"
}

if (-not $didA -and -not $didB) {
if ($doneA -and $doneB) { Write-Host "DLL 已是打过两处补丁的版本，无需修改。" }
else { Write-Host "没有任何可应用的补丁，未写入。" }
return
}

Write-Host "即将修改: 到期时间 2026-09-30 -> 2099-12-31"
if ($WhatIfOnly) { Write-Host "(-WhatIfOnly) 未写入任何内容。"; return }

if (-not (Test-Path -LiteralPath $Backup)) {
Copy-Item -LiteralPath $Path -Destination $Backup
Write-Host ("已备份原始 DLL -> {0}" -f $Backup)
}
[IO.File]::WriteAllBytes($Path, $out)
$chk = [IO.File]::ReadAllBytes($Path)
$okA = $true; $okB = $true
if ($didA) { $okA = (Find-Bytes $chk $sigA_new) -ge 0 -and [BitConverter]::ToUInt64($chk, (Find-Bytes $chk $sigA_new) + $caveDelta) -eq 4102444799 }
if ($didB) { $okB = (Find-Bytes $chk $sigB_new) -ge 0 }
Write-Host ("校验: 补丁①={0} 补丁②={1}" -f $okA, $okB)
if ($didA) {
$v = [BitConverter]::ToUInt64($chk, (Find-Bytes $chk $sigA_new) + $caveDelta)
Write-Host (" ① 到期 = {0} ({1} 北京时间)" -f $v, ([DateTimeOffset]::FromUnixTimeSeconds([int64]$v).ToLocalTime().ToString('yyyy-MM-dd HH:mm:ss')))
}
if ($didB) { Write-Host " ② 到期 = 2099-12-31 23:59:59（本地时区）" }
Write-Host "重启 WeFlow 生效。"
