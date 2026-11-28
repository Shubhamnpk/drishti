'use client'

import {
  ChevronDown, Menu, Search, Sun, Moon, X, ArrowRight, TrendingUp, Building2,
  BarChart3, Map, MapPin, Construction, FileText, CloudSun, AlertTriangle,
  Calendar, Home, Info, Newspaper,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Logo } from '@/components/logo'

type NavItem = { href: string; label: string; desc: string; icon: React.ComponentType<{ size?: number }> }
type NavGroup = { label: string; blurb: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Economy',
    blurb: 'Money, markets and state-owned firms',
    items: [
      { href: '/economy', label: 'Economy overview', desc: 'GDP, prices, people and forecasts', icon: BarChart3 },
      { href: '/market', label: 'Market', desc: 'NEPSE board, sectors and movers', icon: TrendingUp },
      { href: '/companies', label: 'Companies', desc: 'State-owned enterprise finances', icon: Building2 },
    ],
  },
  {
    label: 'Places',
    blurb: 'Provinces, districts and the map',
    items: [
      { href: '/places', label: 'Provinces & districts', desc: '7 provinces, 77 districts, all local units', icon: MapPin },
      { href: '/agencies', label: 'Government agencies', desc: 'Federal, provincial, district & municipal offices', icon: Building2 },
      { href: '/map', label: 'National map', desc: 'Live atlas of Nepal', icon: Map },
    ],
  },
  {
    label: 'Projects',
    blurb: 'Infrastructure and procurement',
    items: [
      { href: '/projects', label: 'Projects', desc: 'Public infrastructure tracker', icon: Construction },
      { href: '/procurement', label: 'Procurement', desc: 'Government tender archive', icon: FileText },
    ],
  },
  {
    label: 'Environment',
    blurb: 'Weather, air, rivers and risk',
    items: [
      { href: '/environment', label: 'Environment overview', desc: 'Weather, air, rivers and quakes', icon: CloudSun },
      { href: '/disasters', label: 'Disasters', desc: 'Incidents, losses and relief', icon: AlertTriangle },
      { href: '/calendar', label: 'Calendar', desc: 'Holidays, fiscal dates and IPOs', icon: Calendar },
    ],
  },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const [mobileNav, setMobileNav] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/places') {
      return pathname === '/places' || pathname.startsWith('/provinces') || pathname.startsWith('/districts')
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  useEffect(() => {
    setMobileNav(false)
    setOpenMenu(null)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileNav) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [mobileNav])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenMenu(null)
      if (searchOpen && !(event.target as HTMLElement)?.closest?.('.search')) setSearchOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
        return
      }
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setMobileNav(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [searchOpen])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const handleEnter = (label: string) => {
    clearTimers()
    openTimer.current = setTimeout(() => setOpenMenu(label), 60)
  }
  const handleLeave = () => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpenMenu(null), 200)
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  if (pathname === '/map' || pathname === '/projects/map') return null

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
        <div className="brand">
          <Link href="/" aria-label="Drishti home"><Logo size={28} /></Link>
        </div>

        <nav id="primary-nav" ref={navRef} className="nav-links" aria-label="Primary">
          <Link
            href="/"
            className={isActive('/') ? 'nav-link active' : 'nav-link'}
            aria-current={isActive('/') ? 'page' : undefined}
            onClick={() => { setOpenMenu(null); setMobileNav(false) }}
          >
            Home
          </Link>

          {navGroups.map(group => {
            const active = group.items.some(item => isActive(item.href))
            const open = openMenu === group.label
            const menuId = `nav-menu-${group.label.toLowerCase()}`

            return (
              <div
                key={group.label}
                className={`nav-group${active ? ' active' : ''}${open ? ' open' : ''}`}
                onMouseEnter={() => handleEnter(group.label)}
                onMouseLeave={handleLeave}
              >
                <button
                  type="button"
                  className="nav-group-toggle"
                  aria-haspopup="true"
                  aria-expanded={open}
                  aria-controls={menuId}
                  onClick={() => setOpenMenu(open ? null : group.label)}
                >
                  <span>{group.label}</span>
                  <ChevronDown size={13} />
                </button>
                <div id={menuId} className="nav-group-menu" role="menu">
                  <div className="nav-menu-header">
                    <div className="nav-menu-title">{group.label}</div>
                    <div className="nav-menu-blurb">{group.blurb}</div>
                  </div>
                  <div className="nav-menu-grid">
                    {group.items.map(item => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={isActive(item.href) ? 'nav-menu-link active' : 'nav-menu-link'}
                          aria-current={isActive(item.href) ? 'page' : undefined}
                          onClick={() => { setOpenMenu(null); setMobileNav(false) }}
                          role="menuitem"
                        >
                          <span className="nav-menu-icon"><Icon size={16} /></span>
                          <span className="nav-menu-text">
                            <strong>{item.label}</strong>
                            <span>{item.desc}</span>
                          </span>
                          <ArrowRight size={13} className="nav-menu-arrow" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          <Link href="/news" className={isActive('/news') ? 'nav-link active' : 'nav-link'} aria-current={isActive('/news') ? 'page' : undefined} onClick={() => { setOpenMenu(null); setMobileNav(false) }}>
            News
          </Link>

          <Link
            href="/about"
            className={isActive('/about') ? 'nav-link active' : 'nav-link'}
            aria-current={isActive('/about') ? 'page' : undefined}
            onClick={() => { setOpenMenu(null); setMobileNav(false) }}
          >
            About
          </Link>
        </nav>

        <div className="top-actions">
          <form className={`search${searchOpen ? ' open' : ''}`} onSubmit={submitSearch}>
            <button
              type="button"
              className="search-trigger"
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} />
            </button>
            <input
              ref={searchInputRef}
              aria-label="Search"
              placeholder="Search Nepal…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
            {searchOpen && query && (
              <button type="submit" className="search-submit" aria-label="Submit search">
                <ArrowRight size={14} />
              </button>
            )}
            {!searchOpen && (
              <kbd className="search-kbd">Ctrl K</kbd>
            )}
          </form>

          <Link href="/search" className="search-jump" aria-label="Search">
            <Search size={17} />
          </Link>

          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation" aria-expanded={mobileNav}>
            {mobileNav ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileNav && (
        <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="mobile-drawer-backdrop" onClick={() => setMobileNav(false)} />
          <div className="mobile-drawer-panel">
            <div className="mobile-drawer-head">
              <Link href="/" onClick={() => setMobileNav(false)} className="mobile-brand">
                <Logo size={26} showText={false} />
                <div>
                  <strong>Drishti</strong>
                  <small>Nepal · Public data</small>
                </div>
              </Link>
              <button className="mobile-drawer-close" onClick={() => setMobileNav(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <div className="mobile-search">
              <Search size={16} />
              <input
                aria-label="Search"
                placeholder="Search Nepal…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && query.trim()) { setMobileNav(false); router.push(`/search?q=${encodeURIComponent(query.trim())}`) } }}
              />
            </div>

            <nav className="mobile-drawer-nav" aria-label="Mobile primary">
              <Link href="/" className={isActive('/') ? 'active' : ''} onClick={() => setMobileNav(false)}>
                <Home size={17} /><span>Home</span>
              </Link>
              {navGroups.map(group => (
                <div key={group.label} className="mobile-group">
                  <div className="mobile-group-label">{group.label}</div>
                  {group.items.map(item => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={isActive(item.href) ? 'active' : ''}
                        onClick={() => setMobileNav(false)}
                      >
                        <Icon size={17} />
                        <div className="mobile-link-text">
                          <span>{item.label}</span>
                          <small>{item.desc}</small>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ))}
              <Link href="/news" className={isActive('/news') ? 'active' : ''} onClick={() => setMobileNav(false)}>
                <Newspaper size={17} /><span>News</span>
              </Link>
              <Link href="/about" className={isActive('/about') ? 'active' : ''} onClick={() => setMobileNav(false)}>
                <Info size={17} /><span>About</span>
              </Link>
            </nav>

            <div className="mobile-drawer-foot">
              <button className="theme-toggle wide" onClick={toggle}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <div className="mobile-foot-links">
                <Link href="/sources" onClick={() => setMobileNav(false)}>Sources</Link>
                <Link href="/datasets" onClick={() => setMobileNav(false)}>Datasets</Link>
                <a href="https://github.com/Shubhamnpk/drishti" target="_blank" rel="noreferrer">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
