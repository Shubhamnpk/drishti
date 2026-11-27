export type TranslationLanguage = 'en' | 'ne'

const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get'
const MYMEMORY_CONTACT = 'info+translation@drishti.bitnepal.net'
const MAX_QUERY_BYTES = 1800
const PAUSE_BETWEEN_REQUESTS_MS = 250

function splitByByteLimit(text: string): Array<{ text: string; separator: string }> {
  const chunks: Array<{ text: string; separator: string }> = []
  const encoder = new TextEncoder()
  let remaining = text

  while (remaining && encoder.encode(remaining).byteLength > MAX_QUERY_BYTES) {
    let bytes = 0
    let end = 0
    for (const char of remaining) {
      const charBytes = encoder.encode(char).byteLength
      if (bytes + charBytes > MAX_QUERY_BYTES) break
      bytes += charBytes
      end += char.length
    }
    let boundary = -1
    for (let index = end - 1; index >= 0; index--) {
      if (/\s/u.test(remaining[index])) { boundary = index; break }
    }
    if (boundary > 0) end = boundary
    if (!end) throw new Error('This text contains a character that cannot be translated.')
    let separator = ''
    if (boundary > 0) {
      let separatorEnd = boundary
      while (separatorEnd < remaining.length && /\s/u.test(remaining[separatorEnd])) separatorEnd++
      separator = remaining.slice(boundary, separatorEnd)
      chunks.push({ text: remaining.slice(0, boundary), separator })
      remaining = remaining.slice(separatorEnd)
    } else {
      chunks.push({ text: remaining.slice(0, end), separator: '' })
      remaining = remaining.slice(end)
    }
  }
  if (remaining) chunks.push({ text: remaining, separator: '' })
  return chunks
}

function pause(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

export async function translateWithMyMemory(text: string, source: TranslationLanguage, target: TranslationLanguage): Promise<string> {
  const normalized = text.trim()
  if (!normalized) throw new Error('There is no text to translate.')
  if (normalized.length > 5000) throw new Error('This free translator supports up to 5,000 characters per article. The original text is still available.')

  const chunks = splitByByteLimit(normalized)
  const translated: string[] = []
  for (const [index, chunk] of chunks.entries()) {
    if (index > 0) await pause(PAUSE_BETWEEN_REQUESTS_MS)
    const params = new URLSearchParams({ q: chunk.text, langpair: `${source}|${target}`, mt: '1', de: MYMEMORY_CONTACT })
    const response = await fetch(`${MYMEMORY_ENDPOINT}?${params}`, { headers: { Accept: 'application/json' } })
    const payload: unknown = await response.json().catch(() => null)
    if (response.status === 429) throw new Error('The free translation service is busy or has reached its daily limit. Try again later.')
    if (!response.ok || !payload || typeof payload !== 'object') {
      throw new Error('The free translation service is temporarily unavailable.')
    }

    const result = payload as {
      responseStatus?: unknown
      responseDetails?: unknown
      responseData?: { translatedText?: unknown }
      quotaFinished?: unknown
      matches?: unknown[]
    }
    if (result.quotaFinished === true) throw new Error('The free translation service has reached its daily limit. Try again later.')
    if (result.responseStatus !== 200 || typeof result.responseData?.translatedText !== 'string') {
      const detail = typeof result.responseDetails === 'string' ? result.responseDetails : ''
      throw new Error(detail || 'The translation service could not translate this text.')
    }
    const neuralMatch = result.matches?.find((match): match is Record<string, unknown> =>
      typeof match === 'object'
      && match !== null
      && typeof (match as Record<string, unknown>).translation === 'string'
      && ((match as Record<string, unknown>).model === 'neural'
        || (match as Record<string, unknown>).reference === 'Machine Translation.'
        || (match as Record<string, unknown>)['created-by'] === 'MT!'))
    const bestText = typeof neuralMatch?.translation === 'string'
      ? neuralMatch.translation
      : result.responseData.translatedText
    translated.push(`${bestText}${chunk.separator}`)
  }
  return translated.join('')
}
