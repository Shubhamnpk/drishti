import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, CalendarDays, Download, ExternalLink, FileText, Heart, Languages, MessageCircle, Newspaper } from 'lucide-react'
import { GovUpdateTranslator } from '@/components/gov-update-translator'
import { OriginalArticle } from '@/components/original-article'
import { fetchNepalGovUpdate, formatNepalGovDate, isNepaliText, NEPAL_GOV_UPDATES_API, nepalGovAttachmentUrl, nepalGovThumbnailUrl, nepalGovUpdatePageUrl } from '@/lib/nepal-gov-updates'
import { pageMetadata, truncate } from '@/lib/seo'

type Props = { params: Promise<{ id: string }> }

async function getUpdate(id: string) {
  try { return await fetchNepalGovUpdate(id) } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const item = /^[\w-]{1,100}$/u.test(id) ? await getUpdate(id) : null
  if (!item) return { title: 'News story not found', robots: { index: false, follow: true } }
  return pageMetadata({
    title: item.title,
    description: truncate(item.content, 155),
    path: `/news/${encodeURIComponent(id)}`,
    noindex: true,
    image: item.thumbnailFilename ? `${NEPAL_GOV_UPDATES_API}/updates/${encodeURIComponent(id)}/thumbnail` : undefined,
    imageAlt: item.thumbnailFilename ? `${item.title} news photo` : undefined,
  })
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params
  if (!/^[\w-]{1,100}$/u.test(id)) notFound()
  const item = await getUpdate(id)
  if (!item) notFound()

  const lang = isNepaliText(`${item.title} ${item.content}`) ? 'ne' : 'en'
  const department = item.author?.departmentUnit?.name || item.author?.department || 'Government of Nepal'
  const translateText = `${item.title}\n\n${item.content}`
  const date = item.updatedAt || item.createdAt

  return (
    <main id="main-content" className="content-wrap gov-updates-page gov-detail-page">
      <nav className="gov-news-crumbs" aria-label="Breadcrumb">
        <Link href="/news"><ArrowLeft size={15} /> All news</Link>
        <span>/</span>
        <span>{department}</span>
      </nav>
      <article className="gov-detail-card">
        <header className="gov-article-header">
          <div className="gov-article-meta">
            <span className="gov-article-section"><Newspaper size={14} /> Official government update</span>
            <span className="gov-article-date"><CalendarDays size={14} /><time dateTime={date}>{formatNepalGovDate(date)}</time></span>
          </div>
          <p className="gov-article-department">{department}</p>
          <h1 lang={isNepaliText(item.title) ? 'ne' : 'en'}>{item.title}</h1>
          {item.author?.name && <p className="gov-byline">Published by <strong>{item.author.name}</strong></p>}
          <a className="gov-article-source" href={nepalGovUpdatePageUrl(item.id)} target="_blank" rel="noreferrer">Read original on nepal.gov.np <ExternalLink size={14} /></a>
        </header>

        {item.thumbnailFilename && (
          <figure className="gov-detail-image">
            <a href={nepalGovThumbnailUrl(item.id)} target="_blank" rel="noreferrer">
              <img src={nepalGovThumbnailUrl(item.id)} alt={`Image accompanying: ${item.title}`} />
              <span>Open image <ArrowUpRight size={14} /></span>
            </a>
          </figure>
        )}

        <div className="gov-detail-layout">
          <section className="gov-detail-story" aria-label="News story">
            <OriginalArticle text={item.content} target={lang} />
          </section>
          <aside className="gov-detail-rail" aria-label="Story tools and documents">
            <section className="gov-detail-translation-panel">
              <div className="gov-detail-panel-kicker"><Languages size={15} /> LANGUAGE</div>
              <h2>Read in {lang === 'ne' ? 'English' : 'Nepali'}</h2>
              <p>Open a translated version alongside the original story.</p>
              <GovUpdateTranslator text={translateText} />
            </section>
            {item.attachments.length > 0 && <section className="gov-detail-sidecard gov-attachments">
              <h2><FileText size={16} /> Documents &amp; attachments</h2>
              <ul>{item.attachments.map(file => <li key={file.id}><FileText size={17} /><span><strong>{file.filename}</strong><small>{file.mimeType} · {(file.size / 1024).toFixed(0)} KB</small></span><a href={nepalGovAttachmentUrl(item.id, file.id)} target="_blank" rel="noreferrer" aria-label={`Open ${file.filename}`}><Download size={16} /></a></li>)}</ul>
            </section>}
            {(item.likes.length > 0 || item.comments.length > 0) && <section className="gov-detail-sidecard gov-engagement" aria-label="Reader engagement">
              {item.likes.length > 0 && <span><Heart size={15} /> {item.likes.length} likes</span>}
              {item.comments.length > 0 && <span><MessageCircle size={15} /> {item.comments.length} comments</span>}
            </section>}
          </aside>
        </div>

        <footer className="gov-detail-source">This story is reproduced from the Government of Nepal portal.<a href={nepalGovUpdatePageUrl(item.id)} target="_blank" rel="noreferrer">Open source record <ArrowUpRight size={13} /></a></footer>
      </article>
    </main>
  )
}
