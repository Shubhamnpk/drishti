'use client'

import { useState } from 'react'
import { Languages } from 'lucide-react'
import { NepalFlag, UkFlag } from '@/components/language-flags'
import { TranslatedArticle } from '@/components/translated-article'
import { isNepaliText } from '@/lib/nepal-gov-updates'
import { translateWithMyMemory, type TranslationLanguage } from '@/lib/translation'

type Props = { text: string }

export function GovUpdateTranslator({ text }: Props) {
  const source: TranslationLanguage = isNepaliText(text) ? 'ne' : 'en'
  const target: TranslationLanguage = source === 'ne' ? 'en' : 'ne'
  const targetLabel = target === 'en' ? 'English' : 'Nepali'
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  async function run() {
    if (result) { setVisible(value => !value); return }
    setBusy(true); setError('')
    try {
      const translated = await translateWithMyMemory(text, source, target)
      setResult(translated)
      setVisible(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Translation failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gov-translator">
      <button type="button" className="gov-translate-action gov-translator-button" disabled={busy} onClick={() => void run()}>
        {target === 'en' ? <UkFlag size={16} /> : <NepalFlag size={16} />}
        <Languages size={14} />
        {busy ? 'Translating…' : result ? (visible ? `Hide ${targetLabel}` : `Show ${targetLabel}`) : `Translate to ${targetLabel}`}
      </button>
      {error && <div className="gov-translation-error" role="status">{error}</div>}
      {visible && result && <div aria-live="polite"><TranslatedArticle text={result} target={target} /></div>}
      <p className="gov-translation-disclosure">Article text and the project contact email are sent to MyMemory. Machine translations may be inaccurate.</p>
    </div>
  )
}