import { useEffect, useState, useRef, type CSSProperties } from 'react'
import { Loader2, Download, Image, Check, X, SlidersHorizontal } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useThemeStore } from '../stores/themeStore'
import './AnnualReportWindow.scss'
import './DualReportWindow.scss'

// SVG 背景图案 (用于导出)
const PATTERN_LIGHT_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><defs><style>.a{fill:none;stroke:#000;stroke-width:1.2;opacity:0.045}.b{fill:none;stroke:#000;stroke-width:1;opacity:0.035}.c{fill:none;stroke:#000;stroke-width:0.8;opacity:0.04}</style></defs><g transform='translate(45,35) rotate(-8)'><circle class='a' cx='0' cy='0' r='16'/><circle class='a' cx='-5' cy='-4' r='2.5'/><circle class='a' cx='5' cy='-4' r='2.5'/><path class='a' d='M-8 4 Q0 12 8 4'/></g><g transform='translate(320,28) rotate(15) scale(0.7)'><path class='b' d='M0 -12 l3 9 9 0 -7 5 3 9 -8 -6 -8 6 3 -9 -7 -5 9 0z'/></g><g transform='translate(180,55) rotate(12)'><path class='a' d='M0 -8 C0 -14 8 -17 12 -10 C16 -17 24 -14 24 -8 C24 4 12 14 12 14 C12 14 0 4 0 -8'/></g><g transform='translate(95,120) rotate(-5) scale(1.1)'><path class='b' d='M0 10 Q-8 10 -8 3 Q-8 -4 0 -4 Q0 -12 10 -12 Q22 -12 22 -2 Q30 -2 30 5 Q30 12 22 12 Z'/></g><g transform='translate(355,95) rotate(8)'><path class='c' d='M0 0 L0 18 M0 0 L18 -4 L18 14'/><ellipse class='c' cx='-4' cy='20' rx='6' ry='4'/><ellipse class='c' cx='14' cy='16' rx='6' ry='4'/></g><g transform='translate(250,110) rotate(-12) scale(0.9)'><rect class='b' x='0' y='0' width='26' height='18' rx='2'/><path class='b' d='M0 2 L13 11 L26 2'/></g><g transform='translate(28,195) rotate(6)'><circle class='a' cx='0' cy='0' r='11'/><path class='a' d='M-5 11 L5 11 M-4 14 L4 14'/><path class='c' d='M-3 -2 L0 -6 L3 -2'/></g><g transform='translate(155,175) rotate(-3) scale(0.85)'><path class='b' d='M0 0 L0 28 Q14 22 28 28 L28 0 Q14 6 0 0'/><path class='b' d='M28 0 L28 28 Q42 22 56 28 L56 0 Q42 6 28 0'/></g><g transform='translate(340,185) rotate(-20) scale(1.2)'><path class='a' d='M0 8 L20 0 L5 6 L8 14 L5 6 L-12 12 Z'/></g><g transform='translate(70,280) rotate(5)'><rect class='b' x='0' y='5' width='30' height='22' rx='4'/><circle class='b' cx='15' cy='16' r='7'/><rect class='b' x='8' y='0' width='14' height='6' rx='2'/></g></svg>`

const PATTERN_DARK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><defs><style>.a{fill:none;stroke:#fff;stroke-width:1.2;opacity:0.055}.b{fill:none;stroke:#fff;stroke-width:1;opacity:0.045}.c{fill:none;stroke:#fff;stroke-width:0.8;opacity:0.05}</style></defs><g transform='translate(45,35) rotate(-8)'><circle class='a' cx='0' cy='0' r='16'/><circle class='a' cx='-5' cy='-4' r='2.5'/><circle class='a' cx='5' cy='-4' r='2.5'/><path class='a' d='M-8 4 Q0 12 8 4'/></g><g transform='translate(320,28) rotate(15) scale(0.7)'><path class='b' d='M0 -12 l3 9 9 0 -7 5 3 9 -8 -6 -8 6 3 -9 -7 -5 9 0z'/></g><g transform='translate(180,55) rotate(12)'><path class='a' d='M0 -8 C0 -14 8 -17 12 -10 C16 -17 24 -14 24 -8 C24 4 12 14 12 14 C12 14 0 4 0 -8'/></g><g transform='translate(95,120) rotate(-5) scale(1.1)'><path class='b' d='M0 10 Q-8 10 -8 3 Q-8 -4 0 -4 Q0 -12 10 -12 Q22 -12 22 -2 Q30 -2 30 5 Q30 12 22 12 Z'/></g><g transform='translate(355,95) rotate(8)'><path class='c' d='M0 0 L0 18 M0 0 L18 -4 L18 14'/><ellipse class='c' cx='-4' cy='20' rx='6' ry='4'/><ellipse class='c' cx='14' cy='16' rx='6' ry='4'/></g><g transform='translate(250,110) rotate(-12) scale(0.9)'><rect class='b' x='0' y='0' width='26' height='18' rx='2'/><path class='b' d='M0 2 L13 11 L26 2'/></g><g transform='translate(28,195) rotate(6)'><circle class='a' cx='0' cy='0' r='11'/><path class='a' d='M-5 11 L5 11 M-4 14 L4 14'/><path class='c' d='M-3 -2 L0 -6 L3 -2'/></g><g transform='translate(155,175) rotate(-3) scale(0.85)'><path class='b' d='M0 0 L0 28 Q14 22 28 28 L28 0 Q14 6 0 0'/><path class='b' d='M28 0 L28 28 Q42 22 56 28 L56 0 Q42 6 28 0'/></g><g transform='translate(340,185) rotate(-20) scale(1.2)'><path class='a' d='M0 8 L20 0 L5 6 L8 14 L5 6 L-12 12 Z'/></g><g transform='translate(70,280) rotate(5)'><rect class='b' x='0' y='5' width='30' height='22' rx='4'/><circle class='b' cx='15' cy='16' r='7'/><rect class='b' x='8' y='0' width='14' height='6' rx='2'/></g></svg>`

// 绘制 SVG 图案背景到 canvas
const drawPatternBackground = async (ctx: CanvasRenderingContext2D, width: number, height: number, bgColor: string, isDark: boolean) => {
  // 先填充背景色
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  // 加载 SVG 图案
  const svgString = isDark ? PATTERN_DARK_SVG : PATTERN_LIGHT_SVG
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  return new Promise<void>((resolve) => {
    const img = new window.Image()
    img.onload = () => {
      // 平铺绘制图案
      const pattern = ctx.createPattern(img, 'repeat')
      if (pattern) {
        ctx.fillStyle = pattern
        ctx.fillRect(0, 0, width, height)
      }
      URL.revokeObjectURL(url)
      resolve()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    img.src = url
  })
}

interface SectionInfo {
  id: string
  name: string
  ref: React.RefObject<HTMLElement | null>
}

interface DualReportMessage {
  content: string
  isSentByMe: boolean
  createTime: number
  createTimeStr: string
}

interface DualReportData {
  year: number
  selfName: string
  friendUsername: string
  friendName: string
  firstChat: {
    createTime: number
    createTimeStr: string
    content: string
    isSentByMe: boolean
    senderUsername?: string
  } | null
  firstChatMessages?: DualReportMessage[]
  yearFirstChat?: {
    createTime: number
    createTimeStr: string
    content: string
    isSentByMe: boolean
    friendName: string
    firstThreeMessages: DualReportMessage[]
  } | null
  stats: {
    totalMessages: number
    totalWords: number
    imageCount: number
    voiceCount: number
    emojiCount: number
    myTopEmojiMd5?: string
    friendTopEmojiMd5?: string
    myTopEmojiUrl?: string
    friendTopEmojiUrl?: string
  }
  topPhrases: Array<{ phrase: string; count: number }>
}

const WordCloud = ({ words }: { words: { phrase: string; count: number }[] }) => {
  if (!words || words.length === 0) {
    return <div className="word-cloud-empty">暂无高频语句</div>
  }
  const sortedWords = [...words].sort((a, b) => b.count - a.count)
  const maxCount = sortedWords.length > 0 ? sortedWords[0].count : 1
  const topWords = sortedWords.slice(0, 32)
  const baseSize = 520

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  const placedItems: { x: number; y: number; w: number; h: number }[] = []

  const canPlace = (x: number, y: number, w: number, h: number): boolean => {
    const halfW = w / 2
    const halfH = h / 2
    const dx = x - 50
    const dy = y - 50
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxR = 49 - Math.max(halfW, halfH)
    if (dist > maxR) return false

    const pad = 1.8
    for (const p of placedItems) {
      if ((x - halfW - pad) < (p.x + p.w / 2) &&
        (x + halfW + pad) > (p.x - p.w / 2) &&
        (y - halfH - pad) < (p.y + p.h / 2) &&
        (y + halfH + pad) > (p.y - p.h / 2)) {
        return false
      }
    }
    return true
  }

  const wordItems = topWords.map((item, i) => {
    const ratio = item.count / maxCount
    const fontSize = Math.round(12 + Math.pow(ratio, 0.65) * 20)
    const opacity = Math.min(1, Math.max(0.35, 0.35 + ratio * 0.65))
    const delay = (i * 0.04).toFixed(2)

    const charCount = Math.max(1, item.phrase.length)
    const hasCjk = /[\u4e00-\u9fff]/.test(item.phrase)
    const hasLatin = /[A-Za-z0-9]/.test(item.phrase)
    const widthFactor = hasCjk && hasLatin ? 0.85 : hasCjk ? 0.98 : 0.6
    const widthPx = fontSize * (charCount * widthFactor)
    const heightPx = fontSize * 1.1
    const widthPct = (widthPx / baseSize) * 100
    const heightPct = (heightPx / baseSize) * 100

    let x = 50, y = 50
    let placedOk = false
    const tries = i === 0 ? 1 : 420

    for (let t = 0; t < tries; t++) {
      if (i === 0) {
        x = 50
        y = 50
      } else {
        const idx = i + t * 0.28
        const radius = Math.sqrt(idx) * 7.6 + (seededRandom(i * 1000 + t) * 1.2 - 0.6)
        const angle = idx * 2.399963 + seededRandom(i * 2000 + t) * 0.35
        x = 50 + radius * Math.cos(angle)
        y = 50 + radius * Math.sin(angle)
      }
      if (canPlace(x, y, widthPct, heightPct)) {
        placedOk = true
        break
      }
    }

    if (!placedOk) return null
    placedItems.push({ x, y, w: widthPct, h: heightPct })

    return (
      <span
        key={i}
        className="word-tag"
        style={{
          '--final-opacity': opacity,
          left: `${x.toFixed(2)}%`,
          top: `${y.toFixed(2)}%`,
          fontSize: `${fontSize}px`,
          animationDelay: `${delay}s`,
        } as CSSProperties}
        title={`${item.phrase} (出现 ${item.count} 次)`}
      >
        {item.phrase}
      </span>
    )
  }).filter(Boolean)

  return (
    <div className="word-cloud-wrapper">
      <div className="word-cloud-inner">
        {wordItems}
      </div>
    </div>
  )
}

function DualReportWindow() {
  const [reportData, setReportData] = useState<DualReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingStage, setLoadingStage] = useState('准备中')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [myEmojiUrl, setMyEmojiUrl] = useState<string | null>(null)
  const [friendEmojiUrl, setFriendEmojiUrl] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [fabOpen, setFabOpen] = useState(false)
  const [exportMode, setExportMode] = useState<'separate' | 'long'>('separate')

  const { currentTheme, themeMode } = useThemeStore()

  // 应用主题到独立窗口
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    document.documentElement.setAttribute('data-mode', themeMode)
  }, [currentTheme, themeMode])

  // Section refs
  const sectionRefs = {
    cover: useRef<HTMLElement>(null),
    firstChat: useRef<HTMLElement>(null),
    yearFirstChat: useRef<HTMLElement>(null),
    topPhrases: useRef<HTMLElement>(null),
    stats: useRef<HTMLElement>(null),
    ending: useRef<HTMLElement>(null),
  }

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
    const username = params.get('username')
    const yearParam = params.get('year')
    const parsedYear = yearParam ? parseInt(yearParam, 10) : 0
    const year = Number.isNaN(parsedYear) ? 0 : parsedYear
    if (!username) {
      setError('缺少好友信息')
      setIsLoading(false)
      return
    }
    generateReport(username, year)
  }, [])

  const generateReport = async (friendUsername: string, year: number) => {
    setIsLoading(true)
    setError(null)
    setLoadingProgress(0)

    const removeProgressListener = window.electronAPI.dualReport.onProgress?.((payload: { status: string; progress: number }) => {
      setLoadingProgress(payload.progress)
      setLoadingStage(payload.status)
    })

    try {
      const result = await window.electronAPI.dualReport.generateReport({ friendUsername, year })
      removeProgressListener?.()
      setLoadingProgress(100)
      setLoadingStage('完成')

      if (result.success && result.data) {
        setReportData(result.data)
        setIsLoading(false)
      } else {
        setError(result.error || '生成报告失败')
        setIsLoading(false)
      }
    } catch (e) {
      removeProgressListener?.()
      setError(String(e))
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadEmojis = async () => {
      if (!reportData) return
      const stats = reportData.stats
      if (stats.myTopEmojiUrl) {
        const res = await window.electronAPI.chat.downloadEmoji(stats.myTopEmojiUrl, stats.myTopEmojiMd5)
        if (res.success && res.localPath) {
          setMyEmojiUrl(res.localPath)
        }
      }
      if (stats.friendTopEmojiUrl) {
        const res = await window.electronAPI.chat.downloadEmoji(stats.friendTopEmojiUrl, stats.friendTopEmojiMd5)
        if (res.success && res.localPath) {
          setFriendEmojiUrl(res.localPath)
        }
      }
    }
    void loadEmojis()
  }, [reportData])

  if (isLoading) {
    return (
      <div className="annual-report-window loading">
        <div className="loading-ring">
          <svg viewBox="0 0 100 100">
            <circle className="ring-bg" cx="50" cy="50" r="42" />
            <circle
              className="ring-progress"
              cx="50" cy="50" r="42"
              style={{ strokeDashoffset: 264 - (264 * loadingProgress / 100) }}
            />
          </svg>
          <span className="ring-text">{loadingProgress}%</span>
        </div>
        <p className="loading-stage">{loadingStage}</p>
        <p className="loading-hint">进行中</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="annual-report-window error">
        <p>生成报告失败: {error}</p>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="annual-report-window error">
        <p>暂无数据</p>
      </div>
    )
  }

  const yearTitle = reportData.year === 0 ? '全部时间' : `${reportData.year}年`
  const firstChat = reportData.firstChat
  const firstChatMessages = (reportData.firstChatMessages && reportData.firstChatMessages.length > 0)
    ? reportData.firstChatMessages.slice(0, 3)
    : firstChat
      ? [{
        content: firstChat.content,
        isSentByMe: firstChat.isSentByMe,
        createTime: firstChat.createTime,
        createTimeStr: firstChat.createTimeStr
      }]
      : []
  const daysSince = firstChat
    ? Math.max(0, Math.floor((Date.now() - firstChat.createTime) / 86400000))
    : null
  const yearFirstChat = reportData.yearFirstChat
  const stats = reportData.stats
  const statItems = [
    { label: '总消息数', value: stats.totalMessages },
    { label: '总字数', value: stats.totalWords },
    { label: '图片', value: stats.imageCount },
    { label: '语音', value: stats.voiceCount },
    { label: '表情', value: stats.emojiCount },
  ]

  const decodeEntities = (text: string) => (
    text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
  )

  const stripCdata = (text: string) => text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')

  const extractXmlText = (content: string) => {
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i)
    if (titleMatch?.[1]) return titleMatch[1]
    const descMatch = content.match(/<des>([\s\S]*?)<\/des>/i)
    if (descMatch?.[1]) return descMatch[1]
    const summaryMatch = content.match(/<summary>([\s\S]*?)<\/summary>/i)
    if (summaryMatch?.[1]) return summaryMatch[1]
    const contentMatch = content.match(/<content>([\s\S]*?)<\/content>/i)
    if (contentMatch?.[1]) return contentMatch[1]
    return ''
  }

  const formatMessageContent = (content?: string) => {
    const raw = String(content || '').trim()
    if (!raw) return '（空）'
    const hasXmlTag = /<\s*[a-zA-Z]+[^>]*>/.test(raw)
    const looksLikeXml = /<\?xml|<msg\b|<appmsg\b|<sysmsg\b|<appattach\b|<emoji\b|<img\b|<voip\b/i.test(raw)
      || hasXmlTag
    if (!looksLikeXml) return raw
    const extracted = extractXmlText(raw)
    if (!extracted) return '（XML消息）'
    return decodeEntities(stripCdata(extracted).trim()) || '（XML消息）'
  }
  const formatFullDate = (timestamp: number) => {
    const d = new Date(timestamp)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${year}/${month}/${day} ${hour}:${minute}`
  }

  const formatNumber = (num: number) => num.toLocaleString()

  // 获取可用的板块列表
  const getAvailableSections = (): SectionInfo[] => {
    if (!reportData) return []
    const sections: SectionInfo[] = [
      { id: 'cover', name: '封面', ref: sectionRefs.cover },
      { id: 'firstChat', name: '首次聊天', ref: sectionRefs.firstChat },
    ]
    if (reportData.yearFirstChat) {
      sections.push({ id: 'yearFirstChat', name: '第一段对话', ref: sectionRefs.yearFirstChat })
    }
    sections.push({ id: 'topPhrases', name: '常用语', ref: sectionRefs.topPhrases })
    sections.push({ id: 'stats', name: '年度统计', ref: sectionRefs.stats })
    sections.push({ id: 'ending', name: '尾声', ref: sectionRefs.ending })
    return sections
  }

  // 导出单个板块 - 统一 16:9 尺寸
  const exportSection = async (section: SectionInfo): Promise<{ name: string; data: string } | null> => {
    const element = section.ref.current
    if (!element) {
      return null
    }

    // 固定输出尺寸 1920x1080 (16:9)
    const OUTPUT_WIDTH = 1920
    const OUTPUT_HEIGHT = 1080

    try {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) selection.removeAllRanges()
      const activeEl = document.activeElement as HTMLElement | null
      activeEl?.blur?.()
      document.body.classList.add('exporting-snapshot')
      document.documentElement.classList.add('exporting-snapshot')

      const originalStyle = element.style.cssText
      element.style.minHeight = 'auto'
      element.style.padding = '40px 20px'
      element.style.background = 'transparent'
      element.style.backgroundColor = 'transparent'
      element.style.boxShadow = 'none'

      // 修复词云
      const wordCloudInner = element.querySelector('.word-cloud-inner') as HTMLElement
      const wordTags = element.querySelectorAll('.word-tag') as NodeListOf<HTMLElement>
      let wordCloudOriginalStyle = ''
      const wordTagOriginalStyles: string[] = []

      if (wordCloudInner) {
        wordCloudOriginalStyle = wordCloudInner.style.cssText
        wordCloudInner.style.transform = 'none'
      }

      wordTags.forEach((tag, i) => {
        wordTagOriginalStyles[i] = tag.style.cssText
        tag.style.opacity = String(tag.style.getPropertyValue('--final-opacity') || '1')
        tag.style.animation = 'none'
      })

      await new Promise(r => setTimeout(r, 50))

      const computedStyle = getComputedStyle(document.documentElement)
      const bgColor = computedStyle.getPropertyValue('--bg-primary').trim() || '#F9F8F6'

      const canvas = await html2canvas(element, {
        backgroundColor: 'transparent', // 透明背景，让 SVG 图案显示
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.body.classList.add('exporting-snapshot')
          clonedDoc.documentElement.classList.add('exporting-snapshot')
          clonedDoc.getSelection?.()?.removeAllRanges()
        },
      })

      // 恢复样式
      element.style.cssText = originalStyle
      if (wordCloudInner) {
        wordCloudInner.style.cssText = wordCloudOriginalStyle
      }
      wordTags.forEach((tag, i) => {
        tag.style.cssText = wordTagOriginalStyles[i]
      })
      document.body.classList.remove('exporting-snapshot')
      document.documentElement.classList.remove('exporting-snapshot')

      // 创建固定 16:9 尺寸的画布
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = OUTPUT_WIDTH
      outputCanvas.height = OUTPUT_HEIGHT
      const ctx = outputCanvas.getContext('2d')!

      // 绘制带 SVG 图案的背景
      const isDark = themeMode === 'dark'
      await drawPatternBackground(ctx, OUTPUT_WIDTH, OUTPUT_HEIGHT, bgColor, isDark)

      // 边距 (留出更多空白)
      const PADDING = 80
      const contentWidth = OUTPUT_WIDTH - PADDING * 2
      const contentHeight = OUTPUT_HEIGHT - PADDING * 2

      // 计算缩放和居中位置
      const srcRatio = canvas.width / canvas.height
      const dstRatio = contentWidth / contentHeight
      let drawWidth: number, drawHeight: number, drawX: number, drawY: number

      if (srcRatio > dstRatio) {
        // 源图更宽，以宽度为准
        drawWidth = contentWidth
        drawHeight = contentWidth / srcRatio
        drawX = PADDING
        drawY = PADDING + (contentHeight - drawHeight) / 2
      } else {
        // 源图更高，以高度为准
        drawHeight = contentHeight
        drawWidth = contentHeight * srcRatio
        drawX = PADDING + (contentWidth - drawWidth) / 2
        drawY = PADDING
      }

      ctx.drawImage(canvas, drawX, drawY, drawWidth, drawHeight)

      return { name: section.name, data: outputCanvas.toDataURL('image/png') }
    } catch (e) {
      document.body.classList.remove('exporting-snapshot')
      return null
    }
  }

  // 导出整个报告为长图
  const exportFullReport = async (filterIds?: Set<string>) => {
    if (!containerRef.current) {
      return
    }
    setIsExporting(true)
    setExportProgress('正在生成长图...')

    try {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) selection.removeAllRanges()
      const activeEl = document.activeElement as HTMLElement | null
      activeEl?.blur?.()
      document.body.classList.add('exporting-snapshot')
      document.documentElement.classList.add('exporting-snapshot')

      const container = containerRef.current
      const sections = container.querySelectorAll('.section')
      const originalStyles: string[] = []

      sections.forEach((section, i) => {
        const el = section as HTMLElement
        originalStyles[i] = el.style.cssText
        el.style.minHeight = 'auto'
        el.style.padding = '40px 0'
      })

      // 如果有筛选，隐藏未选中的板块
      if (filterIds) {
        const available = getAvailableSections()
        available.forEach(s => {
          if (!filterIds.has(s.id) && s.ref.current) {
            s.ref.current.style.display = 'none'
          }
        })
      }

      // 修复词云导出问题
      const wordCloudInner = container.querySelector('.word-cloud-inner') as HTMLElement
      const wordTags = container.querySelectorAll('.word-tag') as NodeListOf<HTMLElement>
      let wordCloudOriginalStyle = ''
      const wordTagOriginalStyles: string[] = []

      if (wordCloudInner) {
        wordCloudOriginalStyle = wordCloudInner.style.cssText
        wordCloudInner.style.transform = 'none'
      }

      wordTags.forEach((tag, i) => {
        wordTagOriginalStyles[i] = tag.style.cssText
        tag.style.opacity = String(tag.style.getPropertyValue('--final-opacity') || '1')
        tag.style.animation = 'none'
      })

      // 等待样式生效
      await new Promise(r => setTimeout(r, 100))

      // 获取计算后的背景色
      const computedStyle = getComputedStyle(document.documentElement)
      const bgColor = computedStyle.getPropertyValue('--bg-primary').trim() || '#F9F8F6'

      const canvas = await html2canvas(container, {
        backgroundColor: 'transparent', // 透明背景
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc.body.classList.add('exporting-snapshot')
          clonedDoc.documentElement.classList.add('exporting-snapshot')
          clonedDoc.getSelection?.()?.removeAllRanges()
        },
      })

      // 恢复原始样式
      sections.forEach((section, i) => {
        const el = section as HTMLElement
        el.style.cssText = originalStyles[i]
      })

      if (wordCloudInner) {
        wordCloudInner.style.cssText = wordCloudOriginalStyle
      }

      wordTags.forEach((tag, i) => {
        tag.style.cssText = wordTagOriginalStyles[i]
      })
      document.body.classList.remove('exporting-snapshot')
      document.documentElement.classList.remove('exporting-snapshot')

      // 创建带 SVG 图案背景的输出画布
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = canvas.width
      outputCanvas.height = canvas.height
      const ctx = outputCanvas.getContext('2d')!

      // 绘制 SVG 图案背景
      const isDark = themeMode === 'dark'
      await drawPatternBackground(ctx, canvas.width, canvas.height, bgColor, isDark)

      // 绘制内容
      ctx.drawImage(canvas, 0, 0)

      const dataUrl = outputCanvas.toDataURL('image/png')
      const link = document.createElement('a')
      const yearFilePrefix = reportData.year === 0 ? '全部时间' : `${reportData.year}年`
      link.download = `${yearFilePrefix}双人报告${filterIds ? '_自定义' : ''}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      alert('导出失败: ' + String(e))
    } finally {
      document.body.classList.remove('exporting-snapshot')
      document.documentElement.classList.remove('exporting-snapshot')
      setIsExporting(false)
      setExportProgress('')
    }
  }

  // 导出选中的板块
  const exportSelectedSections = async () => {
    const sections = getAvailableSections().filter(s => selectedSections.has(s.id))
    if (sections.length === 0) {
      alert('请至少选择一个板块')
      return
    }

    if (exportMode === 'long') {
      setShowExportModal(false)
      await exportFullReport(selectedSections)
      setSelectedSections(new Set())
      return
    }

    setIsExporting(true)
    setShowExportModal(false)

    const exportedImages: { name: string; data: string }[] = []

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      setExportProgress(`正在导出: ${section.name} (${i + 1}/${sections.length})`)

      const result = await exportSection(section)
      if (result) {
        exportedImages.push(result)
      }
    }

    if (exportedImages.length === 0) {
      alert('导出失败')
      setIsExporting(false)
      setExportProgress('')
      return
    }

    const dirResult = await window.electronAPI.dialog.openDirectory({
      title: '选择导出文件夹',
      properties: ['openDirectory', 'createDirectory']
    })
    if (dirResult.canceled || !dirResult.filePaths?.[0]) {
      setIsExporting(false)
      setExportProgress('')
      return
    }

    setExportProgress('正在写入文件...')
    const yearFilePrefix = reportData.year === 0 ? '全部时间' : `${reportData.year}年`
    const exportResult = await window.electronAPI.annualReport.exportImages({
      baseDir: dirResult.filePaths[0],
      folderName: `${yearFilePrefix}双人报告_分模块`,
      images: exportedImages.map((img) => ({
        name: `${yearFilePrefix}双人报告_${img.name}.png`,
        dataUrl: img.data
      }))
    })

    if (!exportResult.success) {
      alert('导出失败: ' + (exportResult.error || '未知错误'))
    }

    setIsExporting(false)
    setExportProgress('')
    setSelectedSections(new Set())
  }

  // 切换板块选择
  const toggleSection = (id: string) => {
    const newSet = new Set(selectedSections)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedSections(newSet)
  }

  // 全选/取消全选
  const toggleAll = () => {
    const sections = getAvailableSections()
    if (selectedSections.size === sections.length) {
      setSelectedSections(new Set())
    } else {
      setSelectedSections(new Set(sections.map(s => s.id)))
    }
  }

  return (
    <div className="annual-report-window dual-report-window">
      <div className="drag-region" />

      <div className="bg-decoration">
        <div className="deco-circle c1" />
        <div className="deco-circle c2" />
        <div className="deco-circle c3" />
        <div className="deco-circle c4" />
        <div className="deco-circle c5" />
      </div>

      {/* 浮动操作按钮 */}
      <div className={`fab-container ${fabOpen ? 'open' : ''}`}>
        <button className="fab-item" onClick={() => { setFabOpen(false); setExportMode('separate'); setShowExportModal(true) }} title="分模块导出">
          <Image size={18} />
        </button>
        <button className="fab-item" onClick={() => { setFabOpen(false); setExportMode('long'); setShowExportModal(true) }} title="自定义导出长图">
          <SlidersHorizontal size={18} />
        </button>
        <button className="fab-item" onClick={() => { setFabOpen(false); exportFullReport() }} title="导出长图">
          <Download size={18} />
        </button>
        <button className="fab-main" onClick={() => setFabOpen(!fabOpen)}>
          {fabOpen ? <X size={22} /> : <Download size={22} />}
        </button>
      </div>

      {/* 导出进度 */}
      {isExporting && (
        <div className="export-overlay">
          <div className="export-progress-modal">
            <div className="export-spinner">
              <div className="spinner-ring"></div>
              <Download size={24} className="spinner-icon" />
            </div>
            <p className="export-title">正在导出</p>
            <p className="export-status">{exportProgress}</p>
          </div>
        </div>
      )}

      {/* 模块选择弹窗 */}
      {showExportModal && (
        <div className="export-overlay" onClick={() => setShowExportModal(false)}>
          <div className="export-modal section-selector" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{exportMode === 'long' ? '自定义导出长图' : '选择要导出的板块'}</h3>
              <button className="close-btn" onClick={() => setShowExportModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="section-grid">
              {getAvailableSections().map(section => (
                <div
                  key={section.id}
                  className={`section-card ${selectedSections.has(section.id) ? 'selected' : ''}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="card-check">
                    {selectedSections.has(section.id) && <Check size={14} />}
                  </div>
                  <span>{section.name}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="select-all-btn" onClick={toggleAll}>
                {selectedSections.size === getAvailableSections().length ? '取消全选' : '全选'}
              </button>
              <button
                className="confirm-btn"
                onClick={exportSelectedSections}
                disabled={selectedSections.size === 0}
              >
                {exportMode === 'long' ? '生成长图' : '导出'} {selectedSections.size > 0 ? `(${selectedSections.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="report-scroll-view">
        <div className="report-container" ref={containerRef}>
          <section className="section" ref={sectionRefs.cover}>
            <div className="label-text">WEFLOW · DUAL REPORT</div>
            <h1 className="hero-title dual-cover-title">{yearTitle}<br />双人聊天报告</h1>
            <hr className="divider" />
            <div className="dual-names">
              <span>{reportData.selfName}</span>
              <span className="amp">&amp;</span>
              <span>{reportData.friendName}</span>
            </div>
            <p className="hero-desc">每一次对话都值得被珍藏</p>
          </section>

          <section className="section" ref={sectionRefs.firstChat}>
            <div className="label-text">首次聊天</div>
            <h2 className="hero-title">故事的开始</h2>
            {firstChat ? (
              <>
                <div className="dual-info-grid">
                  <div className="dual-info-card">
                    <div className="info-label">第一次聊天时间</div>
                    <div className="info-value">{formatFullDate(firstChat.createTime)}</div>
                  </div>
                  <div className="dual-info-card">
                    <div className="info-label">距今天数</div>
                    <div className="info-value">{daysSince} 天</div>
                  </div>
                </div>
                {firstChatMessages.length > 0 ? (
                  <div className="dual-message-list">
                    {firstChatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`dual-message ${msg.isSentByMe ? 'sent' : 'received'}`}
                      >
                        <div className="message-meta">
                          {msg.isSentByMe ? reportData.selfName : reportData.friendName} · {formatFullDate(msg.createTime)}
                        </div>
                        <div className="message-content">{formatMessageContent(msg.content)}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="hero-desc">暂无首条消息</p>
            )}
          </section>

          {yearFirstChat ? (
            <section className="section" ref={sectionRefs.yearFirstChat}>
              <div className="label-text">第一段对话</div>
              <h2 className="hero-title">
                {reportData.year === 0 ? '你们的第一段对话' : `${reportData.year}年的第一段对话`}
              </h2>
              <div className="dual-info-grid">
                <div className="dual-info-card">
                  <div className="info-label">第一段对话时间</div>
                  <div className="info-value">{formatFullDate(yearFirstChat.createTime)}</div>
                </div>
                <div className="dual-info-card">
                  <div className="info-label">发起者</div>
                  <div className="info-value">{yearFirstChat.isSentByMe ? reportData.selfName : reportData.friendName}</div>
                </div>
              </div>
              <div className="dual-message-list">
                {yearFirstChat.firstThreeMessages.map((msg, idx) => (
                  <div key={idx} className={`dual-message ${msg.isSentByMe ? 'sent' : 'received'}`}>
                    <div className="message-meta">
                      {msg.isSentByMe ? reportData.selfName : reportData.friendName} · {formatFullDate(msg.createTime)}
                    </div>
                    <div className="message-content">{formatMessageContent(msg.content)}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="section" ref={sectionRefs.topPhrases}>
            <div className="label-text">常用语</div>
            <h2 className="hero-title">{yearTitle}常用语</h2>
            <WordCloud words={reportData.topPhrases} />
          </section>

          <section className="section" ref={sectionRefs.stats}>
            <div className="label-text">年度统计</div>
            <h2 className="hero-title">{yearTitle}数据概览</h2>
            <div className="dual-stat-grid">
              {statItems.map((item) => {
                const valueText = item.value.toLocaleString()
                const isLong = valueText.length > 7
                return (
                  <div key={item.label} className={`dual-stat-card ${isLong ? 'long' : ''}`}>
                    <div className="stat-num">{valueText}</div>
                    <div className="stat-unit">{item.label}</div>
                  </div>
                )
              })}
            </div>

            <div className="emoji-row">
              <div className="emoji-card">
                <div className="emoji-title">我常用的表情</div>
                {myEmojiUrl ? (
                  <img src={myEmojiUrl} alt="my-emoji" />
                ) : (
                  <div className="emoji-placeholder">{stats.myTopEmojiMd5 || '暂无'}</div>
                )}
              </div>
              <div className="emoji-card">
                <div className="emoji-title">{reportData.friendName}常用的表情</div>
                {friendEmojiUrl ? (
                  <img src={friendEmojiUrl} alt="friend-emoji" />
                ) : (
                  <div className="emoji-placeholder">{stats.friendTopEmojiMd5 || '暂无'}</div>
                )}
              </div>
            </div>
          </section>

          <section className="section" ref={sectionRefs.ending}>
            <div className="label-text">尾声</div>
            <h2 className="hero-title">谢谢你一直在</h2>
            <p className="hero-desc">愿我们继续把故事写下去</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DualReportWindow
