'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import type { ProjectPhoto } from '@/lib/types'

type ProjectGalleryProps = {
  images: ProjectPhoto[]
  projectName: string
}

export function ProjectGallery({ images, projectName }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isOpen = activeIndex !== null

  const orderedImages = [...images].sort((a, b) => (b.capturedAt || b.publishedAt || '').localeCompare(a.capturedAt || a.publishedAt || ''))
  const showImage = (index: number) => setActiveIndex((index + orderedImages.length) % orderedImages.length)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowRight') setActiveIndex(index => index === null ? null : (index + 1) % orderedImages.length)
      if (event.key === 'ArrowLeft') setActiveIndex(index => index === null ? null : (index - 1 + orderedImages.length) % orderedImages.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [orderedImages.length, isOpen])

  if (!images.length) return null

  return (
    <>
      <div className="project-gallery-grid">
        {orderedImages.map((photo, index) => (
          <button
            key={`${photo.src}-${index}`}
            type="button"
            className={`project-gallery-tile${index === 0 ? ' featured' : ''}`}
            onClick={() => showImage(index)}
            aria-label={`Open image ${index + 1} of ${images.length} for ${projectName}`}
          >
            <img src={photo.src} alt={photo.caption || `Photo ${index + 1} for ${projectName}`} loading={index === 0 ? 'eager' : 'lazy'} />
            <span className="project-gallery-expand"><Expand size={15} /> View</span>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${projectName} photo gallery`} onClick={() => setActiveIndex(null)}>
          <div className="gallery-lightbox-shell" onClick={event => event.stopPropagation()}>
            <header className="gallery-lightbox-header">
              <div>
                <span className="gallery-lightbox-kicker">PROJECT PHOTOS</span>
                <strong>{projectName}</strong>
              </div>
              <div className="gallery-lightbox-controls">
                <span className="gallery-lightbox-count">{activeIndex + 1} <span>/</span> {orderedImages.length}</span>
                <button type="button" className="gallery-control" onClick={() => setActiveIndex(null)} aria-label="Close gallery"><X size={19} /></button>
              </div>
            </header>
            <div className="gallery-stage">
              <img src={orderedImages[activeIndex].src} alt={orderedImages[activeIndex].caption || `Photo ${activeIndex + 1} for ${projectName}`} />
              {orderedImages.length > 1 && <>
                <button type="button" className="gallery-arrow previous" onClick={() => showImage(activeIndex - 1)} aria-label="Previous image"><ChevronLeft size={22} /></button>
                <button type="button" className="gallery-arrow next" onClick={() => showImage(activeIndex + 1)} aria-label="Next image"><ChevronRight size={22} /></button>
              </>}
            </div>
            <div className="gallery-photo-meta">
              <p>{orderedImages[activeIndex].caption}</p>
              <span>{orderedImages[activeIndex].credit || 'Photo credit not provided'}{orderedImages[activeIndex].capturedAt ? ` · Photo taken ${formatPhotoDate(orderedImages[activeIndex].capturedAt)}` : orderedImages[activeIndex].publishedAt ? ` · Capture date unavailable · Story published ${formatPhotoDate(orderedImages[activeIndex].publishedAt)}` : ' · Photo date unavailable'}</span>
              {orderedImages[activeIndex].sourceUrl && <a href={orderedImages[activeIndex].sourceUrl} target="_blank" rel="noreferrer">Open original source <Expand size={11} /></a>}
            </div>
            {orderedImages.length > 1 && <div className="gallery-filmstrip" aria-label="Choose a photo">
              {orderedImages.map((photo, index) => <button type="button" key={`${photo.src}-${index}`} onClick={() => setActiveIndex(index)} aria-label={`Show image ${index + 1}: ${photo.caption}`} aria-current={index === activeIndex}>
                <img src={photo.src} alt="" />
              </button>)}
            </div>}
            <footer className="gallery-lightbox-footer"><span>Use arrow keys to browse</span><span>{activeIndex + 1} of {orderedImages.length} photos · newest first</span></footer>
          </div>
        </div>
      )}
    </>
  )
}

function formatPhotoDate(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01T00:00:00Z`)
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'short', year: 'numeric' }).format(date)
  }
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (!Number.isFinite(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}
