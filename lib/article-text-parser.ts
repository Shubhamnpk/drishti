export type ArticleTextLanguage = 'en' | 'ne'
export type ArticleTextBlock = { type: 'paragraph' | 'heading' | 'list'; lines: string[]; ordered?: boolean }

const LIST_LINE = /^\s*(?:[-*•▪‣]|\d{1,3}[.)])\s+(.+)$/u
const SECTION_LINE = /^\s*[0-9०-९]{1,2}[.)]\s+(.+)$/u

function isHeading(line: string, language: ArticleTextLanguage) {
  const clean = line.replace(/^\s{0,3}#{1,6}\s*/, '').trim()
  const sentenceEnd = language === 'ne' ? /[।!?]$/u : /[.!?]$/u
  const knownEnglishHeading = language === 'en' && /^(?:Health Insurance:|Current status of health insurance\.?$|Priorities for health insurance reform\.?$|Our commitment\.?$)/iu.test(clean)
  return clean.length > 0 && clean.length <= 110 && (
    /^\s{0,3}#{1,6}\s+/u.test(line)
    || /:$/.test(clean)
    || /^[A-Z0-9][A-Z0-9 &/(),.'’–-]{3,}$/u.test(clean)
    || knownEnglishHeading
    || (!sentenceEnd.test(clean) && clean.split(/\s+/u).length <= 14)
  )
}

export function parseArticleText(text: string, language: ArticleTextLanguage): ArticleTextBlock[] {
  let normalized = text
    .replace(/\r\n?/gu, '\n')
    .replace(/<br\s*\/?>/giu, '\n')
    .replace(/<\/(?:p|div|section|h[1-6]|li)>/giu, '\n')
    .replace(/<[^>]*>/gu, '')
    .replace(/&(?:nbsp|#160);/giu, ' ')
    .replace(/&amp;/giu, '&')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')

  if (language === 'en') {
    normalized = normalized
      .replace(/(^|\s)((?:Compulsory health insurance|Capacity-based contributions?|Contributions based on capacity|Program integration|Integration of programs|Expansion of services|Service expansion|Digital system|Control of misuse|Control of abuse|Coordination among the three levels of government):)\s+/giu, '$1$2\n')
      .replace(/(?<=[.!?])\s+(?=[A-Z0-9])/gu, '\n')
      .replace(/(^|\n)\s*\d{1,2}[.)]\s*(?=\n)/gu, '$1')
  } else {
    normalized = normalized
      .replace(/\s+([०-९\d]{1,2}[.)]\s+स्वास्थ्य बीमा सुधारका प्राथमिकता)\s+/gu, '\n$1\n')
      .replace(/\s+([०-९\d]{1,2}[.)]\s+हाम्रो प्रतिबद्धता)\s+/gu, '\n$1\n')
      .replace(/(^|\s)(अनिवार्य स्वास्थ्य बीमा|क्षमताअनुसार योगदान|कार्यक्रमको एकीकरण|सेवा विस्तार|डिजिटल प्रणाली|दुरुपयोग नियन्त्रण|तीन तहका सरकारको समन्वय):\s*/gu, '$1$2:\n')
      .replace(/(^|\s)(हाम्रो प्रतिबद्धता)\s+/gu, '$1$2\n')
      .replace(/(?<=।)\s+/gu, '\n')
  }

  const lines = normalized.split('\n').map(line => line.trim())
  const blocks: ArticleTextBlock[] = []
  let paragraph: string[] = []
  const flushParagraph = () => {
    if (paragraph.length) {
      let group: string[] = []
      let length = 0
      const flushGroup = () => {
        if (group.length) blocks.push({ type: 'paragraph', lines: [group.join(' ')] })
        group = []
        length = 0
      }
      for (const sentence of paragraph) {
        if (group.length >= 3 || (length + sentence.length > 480 && group.length)) flushGroup()
        group.push(sentence)
        length += sentence.length
      }
      flushGroup()
    }
    paragraph = []
  }

  for (const line of lines) {
    if (!line) {
      flushParagraph()
      continue
    }
    const sectionMatch = line.match(SECTION_LINE)
    if (sectionMatch) {
      flushParagraph()
      blocks.push({ type: 'heading', lines: [sectionMatch[1]] })
      continue
    }
    const listMatch = line.match(LIST_LINE)
    if (listMatch) {
      flushParagraph()
      const ordered = /^\s*\d/u.test(line)
      const previous = blocks.at(-1)
      if (previous?.type === 'list' && previous.ordered === ordered) previous.lines.push(listMatch[1])
      else blocks.push({ type: 'list', ordered, lines: [listMatch[1]] })
      continue
    }
    if (isHeading(line, language)) {
      flushParagraph()
      blocks.push({ type: 'heading', lines: [line.replace(/^\s{0,3}#{1,6}\s*/u, '').trim().replace(/:$/, '')] })
      continue
    }
    paragraph.push(line)
  }
  flushParagraph()
  return blocks
}
