'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowLeft, Home, ArrowRight, CornerDownLeft } from 'lucide-react'

type Suggestion = {
  label: string
  query: string
  colorClass: string
}

const SUGGESTIONS: Suggestion[] = [
  { label: 'NEPSE Index', query: 'nepse', colorClass: 'chip-green' },
  { label: 'Kathmandu Palika', query: 'kathmandu', colorClass: 'chip-blue' },
  { label: 'Upper Tamakoshi', query: 'upper tamakoshi', colorClass: 'chip-amber' },
  { label: 'Nepal Telecom', query: 'nepal telecom', colorClass: 'chip-purple' },
  { label: 'DHM River Gauges', query: 'river', colorClass: 'chip-teal' },
  { label: 'Inflation & GDP', query: 'inflation', colorClass: 'chip-rose' },
]

function getPageLabel(pathname: string): string {
  if (!pathname || pathname === '/') return 'Home'
  if (pathname.startsWith('/market')) return 'NEPSE Market'
  if (pathname.startsWith('/projects')) return 'Projects'
  if (pathname.startsWith('/companies')) return 'Companies'
  if (pathname.startsWith('/places') || pathname.startsWith('/provinces') || pathname.startsWith('/districts')) return 'Places'
  if (pathname.startsWith('/environment') || pathname.startsWith('/disasters')) return 'Environment'
  if (pathname.startsWith('/economy')) return 'Economy'
  if (pathname.startsWith('/sources')) return 'Sources'
  if (pathname.startsWith('/datasets')) return 'Datasets'
  if (pathname.startsWith('/search')) return 'Search'
  if (pathname.startsWith('/about')) return 'About'

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0) {
    const last = segments[segments.length - 1]
    const clean = decodeURIComponent(last).replace(/-/g, ' ')
    return clean.charAt(0).toUpperCase() + clean.slice(1)
  }
  return 'previous page'
}

export function NotFoundInteractive() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [referrerPage, setReferrerPage] = useState<{ url: string; label: string } | null>(null)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if user came from inside the app
    if (window.history.length > 1) {
      setCanGoBack(true)
    }

    const ref = document.referrer
    if (ref) {
      try {
        const refUrl = new URL(ref)
        if (refUrl.origin === window.location.origin && refUrl.pathname !== window.location.pathname) {
          setReferrerPage({
            url: refUrl.pathname + refUrl.search,
            label: getPageLabel(refUrl.pathname),
          })
        }
      } catch {
        // Ignore invalid URL
      }
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/search')
    }
  }

  function handleBack() {
    if (referrerPage) {
      router.push(referrerPage.url)
    } else if (canGoBack) {
      window.history.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="not-found-interactive">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="not-found-search-form" role="search">
        <div className="not-found-search-input-wrap">
          <Search size={16} className="not-found-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, projects, places, indicators..."
            className="not-found-search-input"
          />
          <button type="submit" className="not-found-search-submit">
            <span>Search</span>
            <CornerDownLeft size={12} />
          </button>
        </div>
      </form>

      {/* Suggested Search Terms with Color Accents */}
      <div className="not-found-suggestions">
        <span className="not-found-suggestions-title">Try searching:</span>
        <div className="not-found-chips">
          {SUGGESTIONS.map((item) => (
            <Link
              key={item.label}
              href={`/search?q=${encodeURIComponent(item.query)}`}
              className={`not-found-chip ${item.colorClass}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Dynamic Actions based on Referrer / History */}
      <div className="not-found-actions">
        {referrerPage ? (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="cta-primary not-found-back-highlight"
              title={`Return to ${referrerPage.label}`}
            >
              <ArrowLeft size={15} />
              <span>Go back to {referrerPage.label}</span>
            </button>
            <Link href="/" className="cta-ghost">
              <Home size={14} />
              <span>Home</span>
            </Link>
          </>
        ) : canGoBack ? (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="cta-primary not-found-back-highlight"
            >
              <ArrowLeft size={15} />
              <span>Go back to previous page</span>
            </button>
            <Link href="/" className="cta-ghost">
              <Home size={14} />
              <span>Home</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/" className="cta-primary">
              <Home size={14} />
              <span>Return home</span>
            </Link>
            <Link href="/sources" className="cta-ghost">
              <span>Source registry</span>
              <ArrowRight size={14} />
            </Link>
          </>
        )}

        <Link href="/search" className="cta-ghost not-found-explore-btn">
          <Search size={14} />
          <span>Global search</span>
        </Link>
      </div>
    </div>
  )
}
