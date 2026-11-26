'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Check, FileText, Languages, Newspaper, Search, Share2, SlidersHorizontal, X } from 'lucide-react'
import { useDocViewer } from '@/components/document-viewer-provider'
import {
  formatNepalGovDate,
  isNepaliText,
  nepalGovThumbnailUrl,
  nepalGovAttachmentUrl,
  nepalGovAttachmentImageUrl,
  type NepalGovUpdate,
  type NepalGovUpdatesResponse,
} from '@/lib/nepal-gov-updates'
import { translateWithMyMemory, type TranslationLanguage } from '@/lib/translation'

type Props = { initial: NepalGovUpdatesResponse; initiallyUnavailable: boolean }
type SearchResult = { id: string; title: string; description: string }
type SortMode = 'newest' | 'oldest' | 'liked' | 'title'
type DateWindow = 'all' | '7' | '30'

const TOPIC_RULES: Array<[string, RegExp]> = [
  ['Economy', /econom|budget|tax|revenue|price|trade|industry|investment|finance|bank|रूपैयाँ|अर्थ|बजेट|राजस्व|कर/iu],
  ['Infrastructure', /road|highway|bridge|building|hydropower|electric|airport|rail|construction|infrastructure|सडक|पुल|विद्युत|निर्माण/iu],
  ['Health', /health|hospital|medicine|medical|vaccine|स्वास्थ्य|अस्पताल|औषधि/iu],
  ['Education', /education|school|university|student|शिक्षा|विद्यालय|विश्वविद्यालय|विद्यार्थी/iu],
  ['Environment', /environment|climate|forest|wildlife|pollution|weather|वातावरण|जलवायु|वन|मौसम/iu],
  ['Public services', /service|citizen|license|passport|online|digital|सेवा|नागरिक|राहदानी|अनलाइन/iu],
  ['Governance', /government|ministry|cabinet|policy|law|committee|सरकार|मन्त्रालय|नीति|कानून|समिति/iu],
]

function departmentOf(item: NepalGovUpdate) {
  return item.author?.departmentUnit?.name || item.author?.department || 'Government of Nepal'
}

function tagNames(item: NepalGovUpdate): string[] {
  const labelFrom = (value: unknown, depth = 0): string | null => {
    if (typeof value === 'string') return value.trim() || null
    if (!value || typeof value !== 'object' || depth > 2) return null
    const record = value as Record<string, unknown>
    for (const key of ['name', 'label', 'title', 'tag', 'value', 'category']) {
      const label = labelFrom(record[key], depth + 1)
      if (label) return label
    }
    return null
  }
  if (!Array.isArray(item.tags)) return []
  return item.tags.map(value => labelFrom(value)).filter((value): value is string => Boolean(value))
}

function topicsOf(item: NepalGovUpdate) {
  const tags = tagNames(item)
  if (tags.length) return tags
  const text = `${item.title} ${item.content.slice(0, 1400)}`
  return TOPIC_RULES.filter(([, pattern]) => pattern.test(text)).map(([topic]) => topic)
}

export function GovernmentUpdatesFeed({ initial, initiallyUnavailable }: Props) {
  const [items, setItems] = useState(initial.items)
  const [knownDepartments, setKnownDepartments] = useState(() => [...new Set(initial.items.map(departmentOf).filter(value => value !== 'Government of Nepal'))])
  const [cursor, setCursor] = useState(initial.nextCursor)
  const [department, setDepartment] = useState('')
  const [feedType, setFeedType] = useState<'news' | 'tenders'>('news')
  const [sort, setSort] = useState<SortMode>('newest')
  const [dateWindow, setDateWindow] = useState<DateWindow>('all')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [readerLoadingId, setReaderLoadingId] = useState<string | null>(null)
  const [searchSort, setSearchSort] = useState<'relevance' | 'title'>('relevance')
  const [selected, setSelected] = useState<NepalGovUpdate | null>(null)
  const [category, setCategory] = useState('')
  const [copied, setCopied] = useState(false)
  const [translation, setTranslation] = useState<{ id: string; target: TranslationLanguage; text: string } | null>(null)
  const [translationVisible, setTranslationVisible] = useState(false)
  const [translationBusy, setTranslationBusy] = useState(false)
  const [translationError, setTranslationError] = useState('')
  const [imagePreview, setImagePreview] = useState<{ src: string; alt: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const { openDocument } = useDocViewer()
  const [error, setError] = useState(initiallyUnavailable ? 'The official feed is temporarily unavailable. Please try again.' : '')
  const departments = useMemo(() => [...new Set([...knownDepartments, ...items.map(departmentOf).filter(value => value !== 'Government of Nepal')])].sort((a, b) => a.localeCompare(b)), [items, knownDepartments])
  const categories = useMemo(() => [...new Set(items.flatMap(topicsOf).filter((value): value is string => typeof value === 'string' && Boolean(value.trim())))].sort((a, b) => a.localeCompare(b)), [items])
  const visibleItems = useMemo(() => {
    const cutoff = dateWindow === 'all' ? 0 : Date.now() - Number(dateWindow) * 86400000
    const filtered = items.filter(item => (!category || topicsOf(item).includes(category)) && (!cutoff || new Date(item.createdAt).getTime() >= cutoff))
    return [...filtered].sort((a, b) => {
      if (sort === 'liked') return b.likes.length - a.likes.length || Date.parse(b.createdAt) - Date.parse(a.createdAt)
      if (sort === 'oldest') return Date.parse(a.createdAt) - Date.parse(b.createdAt)
      if (sort === 'title') return a.title.localeCompare(b.title)
      return Date.parse(b.createdAt) - Date.parse(a.createdAt)
    })
  }, [items, sort, category, dateWindow])
  const visibleSearchResults = useMemo(() => searchSort === 'title' && searchResults
    ? [...searchResults].sort((a, b) => a.title.localeCompare(b.title))
    : searchResults, [searchResults, searchSort])

  useEffect(() => {
    if (!selected && !imagePreview) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (imagePreview) setImagePreview(null)
      else setSelected(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', closeOnEscape) }
  }, [selected, imagePreview])

  async function shareUpdate(item: NepalGovUpdate) {
    const url = `${window.location.origin}/updates/${encodeURIComponent(item.id)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
      } catch { /* Sharing can be unavailable in insecure contexts. */ }
    }
  }

  async function translateUpdate(item: NepalGovUpdate) {
    if (translation?.id === item.id) {
      setTranslationVisible(value => !value)
      return
    }
    const source: TranslationLanguage = isNepaliText(`${item.title} ${item.content}`) ? 'ne' : 'en'
    const target: TranslationLanguage = source === 'ne' ? 'en' : 'ne'
    setTranslationBusy(true)
    setTranslationError('')
    try {
      const text = await translateWithMyMemory(`${item.title}\n\n${item.content}`, source, target)
      setTranslation({ id: item.id, target, text })
      setTranslationVisible(true)
    } catch (cause) {
      setTranslationError(cause instanceof Error ? cause.message : 'Translation failed. Please try again.')
    } finally {
      setTranslationBusy(false)
    }
  }

  async function loadFeed(nextDepartment = feedType === 'tenders' ? 'Tender' : department, append = false) {
    setBusy(true); setError('')
    try {
      const params = new URLSearchParams()
      if (nextDepartment) params.set('department', nextDepartment)
      if (append && cursor) params.set('cursor', cursor)
      const response = await fetch(`/api/government-updates?${params}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not load the feed.')
      const result = payload as NepalGovUpdatesResponse
      setKnownDepartments(current => [...new Set([...current, ...result.items.map(departmentOf).filter(value => value !== 'Government of Nepal')])])
      setItems(current => append ? [...current, ...result.items] : result.items)
      setCursor(result.nextCursor)
      setSearchResults(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the feed.')
    } finally { setBusy(false) }
  }

  async function submitSearch(event: FormEvent) {
    event.preventDefault()
    if (!query.trim()) { setSearchResults(null); return }
    setBusy(true); setError('')
    try {
      const response = await fetch(`/api/government-updates?q=${encodeURIComponent(query.trim())}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Search is temporarily unavailable.')
      setSearchResults(payload.updates as SearchResult[])
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Search is temporarily unavailable.') }
    finally { setBusy(false) }
  }

  function switchFeed(type: 'news' | 'tenders') {
    setFeedType(type)
    setDepartment('')
    setCategory('')
    setDateWindow('all')
    setQuery('')
    setSearchResults(null)
    void loadFeed(type === 'tenders' ? 'Tender' : '')
  }

  function openCard(item: NepalGovUpdate, target: EventTarget | null) {
    if (target instanceof Element && target.closest('a, button, input, select')) return
    setTranslationError('')
    setSelected(item)
  }

  async function openSearchResult(result: SearchResult) {
    setReaderLoadingId(result.id)
    setError('')
    try {
      const response = await fetch(`/api/government-updates/${encodeURIComponent(result.id)}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not open this update.')
      setTranslationError('')
      setSelected(payload as NepalGovUpdate)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open this update.')
    } finally { setReaderLoadingId(null) }
  }

  return (
    <section className="gov-feed" aria-label="Government updates feed">
      <div className="gov-feed-tabs" role="tablist" aria-label="Government portal feed">
        <button role="tab" aria-selected={feedType === 'news'} className={feedType === 'news' ? 'active' : ''} onClick={() => switchFeed('news')}><Newspaper size={16} /> News</button>
        <button role="tab" aria-selected={feedType === 'tenders'} className={feedType === 'tenders' ? 'active' : ''} onClick={() => switchFeed('tenders')}><FileText size={16} /> Tenders <span>PPMO</span></button>
      </div>
      <div className="gov-feed-tools">
        <form className="gov-search" onSubmit={submitSearch}>
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search updates in Nepali or English" aria-label="Search government updates" />
          {query && <button type="button" className="gov-search-clear" aria-label="Clear search" onClick={() => { setQuery(''); setSearchResults(null) }}><X size={15} /></button>}
          <button type="submit" disabled={busy}>Search</button>
        </form>
        {feedType === 'news' ? <label className="gov-department-filter"><SlidersHorizontal size={15} /><span className="sr-only">Filter by department</span>
          <select value={department} onChange={event => { const value = event.target.value; setDepartment(value); void loadFeed(value) }}>
            <option value="">All departments</option>
            {departments.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </label> : <div className="gov-tender-source"><SlidersHorizontal size={15} />Public Procurement Monitoring Office</div>}
        <label className="gov-department-filter"><span className="sr-only">Filter by topic</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="">All topics</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="gov-department-filter"><span className="sr-only">Filter by date</span><select value={dateWindow} onChange={event => setDateWindow(event.target.value as DateWindow)}><option value="all">Any time</option><option value="7">Past 7 days</option><option value="30">Past 30 days</option></select></label>
      </div>
      <p className="gov-filter-note">Topics use portal tags when available; otherwise, they are inferred from the update text.</p>

      <div className="gov-feed-heading"><div><span className="eyebrow">PORTAL FEED</span><h2>{searchResults ? 'Search results' : 'Recent publications'}</h2><p>{searchResults ? `${searchResults.length} matches for “${query.trim()}”` : `${visibleItems.length} shown from ${items.length} loaded`}</p></div>
        {searchResults ? <div className="gov-feed-sort"><label htmlFor="gov-search-sort">Sort by</label><select id="gov-search-sort" value={searchSort} onChange={event => setSearchSort(event.target.value as 'relevance' | 'title')}><option value="relevance">Best match</option><option value="title">Title A–Z</option></select></div> : <div className="gov-feed-sort"><label htmlFor="gov-sort">Sort by</label><select id="gov-sort" value={sort} onChange={event => setSort(event.target.value as SortMode)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="liked">Most liked</option><option value="title">Title A–Z</option></select></div>}
      </div>

      {(category || dateWindow !== 'all' || department) && !searchResults && <div className="gov-active-filters"><span>Filtered view</span>{department && <button onClick={() => { setDepartment(''); void loadFeed('') }}>{department} <X size={12} /></button>}{category && <button onClick={() => setCategory('')}>{category} <X size={12} /></button>}{dateWindow !== 'all' && <button onClick={() => setDateWindow('all')}>Past {dateWindow} days <X size={12} /></button>}<button className="gov-clear-filters" onClick={() => { setCategory(''); setDateWindow('all'); if (department) { setDepartment(''); void loadFeed('') } }}>Clear all</button></div>}

      {error && <div className="gov-feed-message" role="status">{error}<button onClick={() => void loadFeed()}>Retry</button></div>}
      {busy && <p className="gov-loading" role="status">Loading government updates…</p>}
      {!busy && visibleSearchResults && visibleSearchResults.length === 0 && <div className="gov-empty">No matching updates were found. Try a different phrase.</div>}
      {!busy && visibleSearchResults && visibleSearchResults.length > 0 && <div className="gov-update-list">{visibleSearchResults.map(result => <article className="gov-search-result" key={result.id} tabIndex={0} onClick={() => void openSearchResult(result)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void openSearchResult(result) } }}>
        <div><span className="gov-tag">Search match</span><h3 lang={isNepaliText(result.title) ? 'ne' : 'en'}>{result.title}</h3><p lang={isNepaliText(result.description) ? 'ne' : 'en'}>{result.description}</p></div>{readerLoadingId === result.id ? <span className="gov-loading-small">Opening…</span> : <ArrowUpRight size={18} />}
      </article>)}</div>}
      {!busy && !searchResults && visibleItems.length === 0 && <div className="gov-empty">No updates are available for this department right now.</div>}
      {!searchResults && <div className="gov-update-list">{visibleItems.map(item => {
        const titleLang = isNepaliText(item.title) ? 'ne' : 'en'
        const summary = item.content.replace(/\s+/g, ' ').trim().slice(0, 300)
        return <article className={`gov-update-card${selected?.id === item.id ? ' selected' : ''}`} key={item.id} tabIndex={0} onClick={event => openCard(item, event.target)} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(item) } }} aria-label={`Read update: ${item.title}`}>
          {item.thumbnailFilename && <button type="button" className="gov-update-image" onClick={event => { event.stopPropagation(); setImagePreview({ src: nepalGovThumbnailUrl(item.id), alt: item.title }) }} aria-label={`View image for ${item.title}`}><img src={nepalGovThumbnailUrl(item.id)} alt="" loading="lazy" /></button>}
          <div className="gov-update-main"><div className="gov-update-meta"><span className="gov-tag">{departmentOf(item)}</span><time dateTime={item.updatedAt || item.createdAt}>{formatNepalGovDate(item.updatedAt || item.createdAt)}</time></div>
            <h3 lang={titleLang}><span className="gov-title-button">{item.title}</span></h3>
            {summary && <p className="gov-update-summary" lang={isNepaliText(summary) ? 'ne' : 'en'}>{summary}{item.content.length > summary.length ? '…' : ''}</p>}
            <div className="gov-update-footer"><span>{item.attachments.length > 0 && <><FileText size={14} /> {item.attachments.length} {item.attachments.length === 1 ? 'attachment' : 'attachments'}</>}</span><div><span className="gov-card-open-hint">Click anywhere to read <ArrowUpRight size={13} /></span></div></div>
          </div>
        </article>
      })}</div>}
      {!searchResults && cursor && <button className="gov-load-more" disabled={busy} onClick={() => void loadFeed(feedType === 'tenders' ? 'Tender' : department, true)}>{busy ? 'Loading…' : <>Load more <ArrowDown size={15} /></>}</button>}
      {searchResults && <button className="gov-back-feed" onClick={() => { setSearchResults(null); setQuery('') }}>Back to recent updates</button>}
      {selected && <div className="gov-reader-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}>
        <aside className="gov-reader-panel" role="dialog" aria-modal="true" aria-label="Read government update">
          <div className="gov-reader-head"><div><span className="eyebrow">GOV NEWS</span><span>{departmentOf(selected)}</span></div><button className="gov-reader-close" onClick={() => setSelected(null)} aria-label="Close reader"><X size={19} /></button></div>
          <div className="gov-reader-body">
            <time dateTime={selected.updatedAt || selected.createdAt}>{formatNepalGovDate(selected.updatedAt || selected.createdAt)}</time>
            <h2 lang={isNepaliText(selected.title) ? 'ne' : 'en'}>{selected.title}</h2>
            {selected.author?.name && <p className="gov-reader-author">{selected.author.name}</p>}
            {topicsOf(selected).length > 0 && <div className="gov-reader-tags">{topicsOf(selected).map(tag => <span className="gov-tag" key={tag}>{tag}</span>)}</div>}
            {selected.thumbnailFilename && <button className="gov-reader-image-button" onClick={() => setImagePreview({ src: nepalGovThumbnailUrl(selected.id), alt: selected.title })} aria-label="Enlarge update image"><img className="gov-reader-image" src={nepalGovThumbnailUrl(selected.id)} alt="Update image; select to enlarge" /></button>}
            <div className="gov-reader-content" lang={isNepaliText(selected.content) ? 'ne' : 'en'}>{selected.content}</div>
            {translationVisible && translation?.id === selected.id && <section className="gov-translation-result"><div><Languages size={15} /><strong>{translation.target === 'en' ? 'English translation' : 'Nepali translation'}</strong><span>MyMemory</span></div><p lang={translation.target}>{translation.text}</p></section>}
            {translationError && <div className="gov-translation-error" role="status">{translationError}</div>}
            {selected.attachments.length > 0 && <section className="gov-reader-files"><h3>Documents & attachments</h3>{selected.attachments.map(file => {
              const url = nepalGovAttachmentUrl(selected.id, file.id)
              const isPdf = file.mimeType.toLowerCase().includes('pdf') || file.filename.toLowerCase().endsWith('.pdf')
              const isImage = file.mimeType.toLowerCase().startsWith('image/')
              return <div className={`gov-reader-file${isImage ? ' has-image' : ''}`} key={file.id}>{isImage ? <button className="gov-attachment-image" onClick={() => setImagePreview({ src: nepalGovAttachmentImageUrl(selected.id, file.id), alt: file.filename })} aria-label={`Enlarge ${file.filename}`}><img src={nepalGovAttachmentImageUrl(selected.id, file.id)} alt={file.filename} loading="lazy" /></button> : <FileText size={17} />}<span><strong>{file.filename}</strong><small>{file.mimeType} · {(file.size / 1024).toFixed(0)} KB</small></span>{isPdf && <button onClick={() => openDocument(url, file.filename)}>Preview PDF</button>}<a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${file.filename}`}><ArrowUpRight size={15} /></a></div>
            })}</section>}
          </div>
          <div className="gov-reader-actions"><button onClick={() => void shareUpdate(selected)}>{copied ? <Check size={16} /> : <Share2 size={16} />}{copied ? 'Link copied' : 'Share'}</button><button className="gov-translate-action" title="Free MyMemory translation. Text is sent to MyMemory; anonymous use is limited to 5,000 characters per day." disabled={translationBusy} onClick={() => void translateUpdate(selected)}><Languages size={15} />{translationBusy ? 'Translating…' : translation?.id === selected.id ? translationVisible ? 'Show original' : 'Show translation' : `Translate to ${isNepaliText(`${selected.title} ${selected.content}`) ? 'English' : 'Nepali'}`}</button><Link href={`/updates/${encodeURIComponent(selected.id)}`}>Full page <ArrowUpRight size={14} /></Link></div>
          <p className="gov-translation-disclosure">Free MyMemory translation; article text is sent to the service. Anonymous use has a daily limit.</p>
        </aside>
      </div>}
      {imagePreview && <div className="gov-image-lightbox" role="dialog" aria-modal="true" aria-label={imagePreview.alt} onMouseDown={event => { if (event.target === event.currentTarget) setImagePreview(null) }} onKeyDown={event => { event.stopPropagation(); if (event.key === 'Escape') setImagePreview(null) }}><button className="gov-image-close" onClick={() => setImagePreview(null)} aria-label="Close image"><X size={22} /></button><img src={imagePreview.src} alt={imagePreview.alt} /><p>{imagePreview.alt}<span>Click outside or press Esc to close</span></p></div>}
    </section>
  )
}
