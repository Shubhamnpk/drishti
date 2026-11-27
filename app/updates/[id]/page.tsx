import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Download, FileText, Heart, MessageCircle } from 'lucide-react'
import { GovUpdateTranslator } from '@/components/gov-update-translator'
import {
  fetchNepalGovUpdate,
  formatNepalGovDate,
  isNepaliText,
  nepalGovAttachmentUrl,
  nepalGovThumbnailUrl,
  nepalGovUpdatePageUrl,
} from '@/lib/nepal-gov-updates'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const item = await fetchNepalGovUpdate(id)
    return item ? { title: item.title, description: item.content.slice(0, 155), alternates: { canonical: `/updates/${encodeURIComponent(id)}` } } : { title: 'Update not found' }
  } catch { return { title: 'Government update' } }
}

export default async function GovernmentUpdateDetail({ params }: Props) {
  const { id } = await params
  if (!/^[\w-]{1,100}$/.test(id)) notFound()
  let item
  try { item = await fetchNepalGovUpdate(id) } catch { item = null }
  if (!item) notFound()
  const lang = isNepaliText(`${item.title} ${item.content}`) ? 'ne' : 'en'
  const department = item.author?.departmentUnit?.name || item.author?.department || 'Government of Nepal'
  const translateText = `${item.title}\n\n${item.content}`

  return <main id="main-content" className="content-wrap gov-updates-page gov-detail-page">
    <Link href="/updates" className="gov-back-link"><ArrowLeft size={15} /> All government updates</Link>
    <article className="gov-detail-card">
      <div className="gov-detail-top"><span className="gov-tag">{department}</span><time dateTime={item.updatedAt || item.createdAt}>{formatNepalGovDate(item.updatedAt || item.createdAt)}</time></div>
      <h1 lang={isNepaliText(item.title) ? 'ne' : 'en'}>{item.title}</h1>
      {item.author?.name && <p className="gov-byline">Published by <strong>{item.author.name}</strong></p>}
      <div className="gov-detail-actions"><a href={nepalGovUpdatePageUrl(item.id)} target="_blank" rel="noreferrer">View on official portal <ArrowUpRight size={14} /></a></div>
      <GovUpdateTranslator text={translateText} />
      {item.thumbnailFilename && <a className="gov-detail-image" href={nepalGovThumbnailUrl(item.id)} target="_blank" rel="noreferrer"><img src={nepalGovThumbnailUrl(item.id)} alt="Image attached to this government update" /></a>}
      <div className="gov-detail-content" lang={lang}>{item.content}</div>
      {(item.attachments.length > 0 || item.likes.length > 0 || item.comments.length > 0) && <section className="gov-detail-extras">
        {item.attachments.length > 0 && <div className="gov-attachments"><h2>Attachments</h2><ul>{item.attachments.map(file => <li key={file.id}><FileText size={17} /><span><strong>{file.filename}</strong><small>{file.mimeType} · {(file.size / 1024).toFixed(0)} KB</small></span><a href={nepalGovAttachmentUrl(item.id, file.id)} target="_blank" rel="noreferrer" aria-label={`Open ${file.filename}`}><Download size={16} /></a></li>)}</ul></div>}
        <div className="gov-engagement">{item.likes.length > 0 && <span><Heart size={15} /> {item.likes.length} likes</span>}{item.comments.length > 0 && <span><MessageCircle size={15} /> {item.comments.length} comments</span>}</div>
      </section>}
      <footer className="gov-detail-source">This record is displayed from the Government of Nepal portal. <a href={nepalGovUpdatePageUrl(item.id)} target="_blank" rel="noreferrer">Open original record <ArrowUpRight size={13} /></a></footer>
    </article>
  </main>
}
