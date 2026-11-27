'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Languages, Pause, Play, Square, Volume2 } from 'lucide-react'
import { parseArticleText } from '@/lib/article-text-parser'

type TargetLanguage = 'en' | 'ne'
type Props = { text: string; target: TargetLanguage }

function renderHighlighted(text: string, keyPrefix: string) {
  const pattern = /((?:(?:रु|रू)\.?|Rs\.?|NPR|\$|€)\s?[\p{Nd}][\p{Nd},]*(?:\.[\p{Nd}]+)?|[\p{Nd}]{1,3}(?:,[\p{Nd}]{3})+(?:\.[\p{Nd}]+)?|[\p{Nd}]+(?:\.[\p{Nd}]+)?\s?(?:%|percent|प्रतिशत|million|billion|crore|lakh|करोड|लाख|अर्ब|खर्ब)|[\p{Nd}]{3,}(?:\.[\p{Nd}]+)?)/giu
  const parts = text.split(pattern)
  return parts.map((part, index) => (
    index % 2 === 1
      ? <mark className="gov-hl" key={`${keyPrefix}-${index}`}>{part}</mark>
      : <span key={`${keyPrefix}-${index}`}>{part}</span>
  ))
}

export function TranslatedArticle({ text, target }: Props) {
  const [copied, setCopied] = useState(false)
  const blocks = parseArticleText(text, target)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceUri, setVoiceUri] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speechError, setSpeechError] = useState('')

  useEffect(() => {
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') return
    const synth = window.speechSynthesis
    const updateVoices = () => setVoices(synth.getVoices())
    setSpeechSupported(true)
    updateVoices()
    synth.addEventListener('voiceschanged', updateVoices)
    return () => {
      synth.removeEventListener('voiceschanged', updateVoices)
      synth.cancel()
    }
  }, [])

  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
    setSpeechError('')
  }, [text, target])

  function startReading() {
    if (!speechSupported || !text.trim()) return
    const synth = window.speechSynthesis
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = target === 'en' ? 'en-NP' : 'ne-NP'
    const selectedVoice = voices.find(voice => voice.voiceURI === voiceUri)
    const matchingVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(target))
    const voice = selectedVoice ?? matchingVoice
    if (voice) utterance.voice = voice
    utterance.onend = () => { setSpeaking(false); setPaused(false) }
    utterance.onerror = event => {
      if (event.error === 'canceled' || event.error === 'interrupted') return
      setSpeaking(false)
      setPaused(false)
      setSpeechError('Speech playback could not start with the selected voice.')
    }
    setSpeechError('')
    setSpeaking(true)
    setPaused(false)
    synth.speak(utterance)
  }

  function stopReading() {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  return (
    <section className="gov-translation-result">
      <div className="gov-translation-result-head">
        <div><Languages size={15} /><strong>{target === 'en' ? 'English translation' : 'नेपाली अनुवाद'}</strong></div>
        <div className="gov-translation-result-meta"><span>MyMemory</span>
          <button type="button" className="gov-translation-copy" onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500) } catch {} }} aria-label="Copy translation">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
        </div>
      </div>
      <div className="gov-translation-speech" role="group" aria-label="Read translation aloud">
        <label className="gov-translation-voice"><Volume2 size={15} /><span className="sr-only">Speech voice</span>
          <select value={voiceUri} onChange={event => setVoiceUri(event.target.value)} disabled={!speechSupported || voices.length === 0} aria-label="Choose a speech voice">
            <option value="">Automatic voice</option>
            {voices.map(voice => <option value={voice.voiceURI} key={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}
          </select>
        </label>
        {!speaking ? <button type="button" onClick={startReading} disabled={!speechSupported}><Play size={14} /> Read aloud</button> : <>
          <button type="button" onClick={() => { window.speechSynthesis.pause(); setPaused(true) }} disabled={paused}><Pause size={14} /> Pause</button>
          {paused && <button type="button" onClick={() => { window.speechSynthesis.resume(); setPaused(false) }}><Play size={14} /> Resume</button>}
          <button type="button" onClick={stopReading}><Square size={13} /> Stop</button>
        </>}
        {!speechSupported && <span className="gov-translation-speech-note">Speech playback is unavailable in this browser.</span>}
        {speechSupported && voices.length === 0 && <span className="gov-translation-speech-note">Using the device’s default voice.</span>}
      </div>
      {speechError && <p className="gov-translation-speech-error" role="status">{speechError}</p>}
      <div className="gov-translation-body">
        {blocks.map((block, index) => {
          const content = block.lines.map((line, lineIndex) => renderHighlighted(line, `block-${index}-${lineIndex}`))
          if (block.type === 'heading') return <h3 className="gov-translation-heading" lang={target} key={`block-${index}`}>{content}</h3>
          if (block.type === 'list') {
            const List = block.ordered ? 'ol' : 'ul'
            return <List className="gov-translation-list" lang={target} key={`block-${index}`}>{content.map((item, itemIndex) => <li key={`item-${itemIndex}`}>{item}</li>)}</List>
          }
          return <p lang={target} key={`block-${index}`}>{content}</p>
        })}
      </div>
    </section>
  )
}
