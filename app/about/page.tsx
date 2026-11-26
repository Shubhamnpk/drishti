import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CircleHelp, ExternalLink, Eye, FileCheck2, Scale } from 'lucide-react'
import { companies, projects, sources } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'About Drishti and our data methodology',
  description: 'Learn what Drishti stands for, where its public records come from, how fresh each feed is, and how to trace a figure back to its source.',
  path: '/about',
})

const principles = [
  {
    icon: Eye,
    number: '01',
    title: 'Make public records easier to see',
    text: 'Useful information is often spread across reports, portals and data feeds. Drishti brings those records into one place so people can explore them without losing sight of where they came from.',
  },
  {
    icon: FileCheck2,
    number: '02',
    title: 'Put evidence before claims',
    text: 'A figure should come with its publisher, reporting period and source notes wherever those details are available. The original source remains the authority for its record.',
  },
  {
    icon: Scale,
    number: '03',
    title: 'Keep context attached',
    text: 'Budgets, spending, progress and economic indicators can use different periods and definitions. Notes help explain those differences before numbers are compared.',
  },
  {
    icon: CircleHelp,
    number: '04',
    title: 'Be clear about what is unknown',
    text: 'Public data can be late, incomplete or unavailable. Drishti aims to show those gaps honestly instead of presenting missing values as facts.',
  },
]

const cadence = [
  ['Currency', 'Nepal Rastra Bank official fixing', 'Hourly', true],
  ['NEPSE market', 'NEPSE prices and indices via YONepse', 'Hourly', true],
  ['Disasters and alerts', 'BIPAD portal, Ministry of Home Affairs', 'Hourly', true],
  ['Weather, rainfall and rivers', 'Department of Hydrology and Meteorology', 'Twice daily', true],
  ['Earthquakes', 'USGS earthquake catalogue', 'Every 15 minutes', true],
  ['Macro indicators', 'World Bank Open Data, 36 Nepal series', 'Daily', false],
  ['Forecasts', 'IMF World Economic Outlook', 'Daily', false],
  ['Procurement', 'OCDS and e-GP tender archive', 'Daily', false],
  ['Census, places and local units', 'DataNepal mirror of CBS 2021 and ECN 2026', 'Static', false],
  ['Enterprises and projects', 'Ministry of Finance and NPC reports', 'On publication', false],
] as const

const faqs = [
  {
    q: 'Is Drishti an official government website?',
    a: 'No. Drishti is an independent, open-source index. Every record points back to the government, multilateral or market publisher that issued it, and that publisher remains the authority for the record.',
  },
  {
    q: 'Where does the data actually come from?',
    a: 'From public endpoints and published documents: Nepal Rastra Bank, NEPSE, BIPAD, DHM, USGS, the World Bank, the IMF, DataNepal, Open Data Nepal and OCDS, among others. The full list with endpoints is in the source registry.',
  },
  {
    q: 'How current is what I am looking at?',
    a: 'It depends on the feed. Market, currency and disaster figures refresh hourly; weather twice a day; statistics move when the publisher revises them. The coverage table above sets out each family, and pages label live figures clearly.',
  },
  {
    q: 'Can I reuse the data?',
    a: 'The site code is released under the MIT licence. The underlying records belong to their publishers, so check the publisher terms before republishing a dataset or a figure.',
  },
  {
    q: 'A number looks wrong. What should I do?',
    a: 'Send the page and the supporting source to the public issue tracker. Corrections are most useful when they include the official document, the reporting period and the figure you expected to see.',
  },
  {
    q: 'Is there an account, a paywall or advertising?',
    a: 'No. Drishti is free to read, needs no account, and carries no ads. It is maintained as a public-interest project.',
  },
]

const projectFacts = [
  {
    title: 'Who builds it',
    text: 'Drishti is built and maintained independently as an open-source project. There is no newsroom behind it, just a small codebase, public feeds and a lot of checking.',
  },
  {
    title: 'Licence and reuse',
    text: 'The code is MIT licensed. Public records keep the terms of the body that published them. If you reuse a figure, credit the original publisher, not Drishti.',
  },
  {
    title: 'Corrections and contact',
    text: 'Questions, corrections and feature requests all go through the public issue tracker. Reports that cite a source get looked at first.',
  },
]

const areas = [
  ['/companies', 'Public companies', 'Financial reports and public enterprise records'],
  ['/projects', 'Infrastructure projects', 'Budgets, reported progress and project evidence'],
  ['/procurement', 'Procurement', 'Public tender and contract records'],
  ['/economy', 'Economy', 'National indicators and forecasts'],
  ['/market', 'NEPSE market', 'Market activity, listed companies and disclosures'],
  ['/places', 'Places in Nepal', 'Province, district and local unit profiles'],
  ['/environment', 'Environment', 'Weather, air quality, rivers and earthquakes'],
  ['/datasets', 'Open datasets', 'Searchable datasets from public data portals'],
]

export default function AboutPage() {
  return (
    <main className="content-wrap about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="eyebrow">ABOUT DRISHTI</p>
          <h1>Public data belongs in public view.</h1>
          <p className="about-lede">
            Drishti is an open-source civic data project that makes Nepal&apos;s public records easier to find, understand and verify. It brings information about public companies, infrastructure, the economy, places and the environment into one clear view.
          </p>
          <div className="about-actions">
            <Link href="/sources" className="cta-primary">See our sources <ArrowRight size={15} /></Link>
            <Link href="#ideology" className="cta-ghost">What we believe</Link>
          </div>
        </div>

        <aside className="about-snapshot" aria-label="Drishti public data coverage">
          <img
            className="about-snapshot-image"
            src="/images/nepal-infrastructure-about.webp"
            alt="Illustrative image of road construction in a mountainous landscape"
            width={1024}
            height={1024}
          />
          <div className="about-snapshot-content">
            <p className="eyebrow">THE IDEA</p>
            <p className="about-snapshot-quote">Evidence first.<br /><span>Context always.</span></p>
            <div className="about-snapshot-stats">
              <div><strong>{companies.length}</strong><span>public enterprises</span></div>
              <div><strong>{projects.length}</strong><span>infrastructure projects</span></div>
              <div><strong>{sources.length}</strong><span>listed sources</span></div>
            </div>
            <p className="about-snapshot-note">Coverage reflects the records currently catalogued in Drishti. Image is illustrative.</p>
          </div>
        </aside>
      </section>

      <nav className="about-index" aria-label="On this page">
        <span>On this page</span>
        <a href="#ideology">Ideology</a>
        <a href="#methodology">Methodology</a>
        <a href="#coverage">Coverage</a>
        <a href="#faq">Questions</a>
        <a href="#project">Project</a>
      </nav>

      <section id="ideology" className="about-section">
        <div className="about-section-heading">
          <p className="eyebrow">OUR IDEOLOGY</p>
          <h2>Public information should be useful, traceable and open to question.</h2>
          <p>We believe people should be able to follow a number back to its source, understand what it measures, and see where the record leaves questions unanswered.</p>
        </div>
        <div className="about-principles">
          {principles.map(({ icon: Icon, number, title, text }) => (
            <article className="about-principle" key={number}>
              <div className="about-principle-top"><span>{number}</span><span className="about-principle-icon"><Icon size={17} aria-hidden="true" /></span></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="methodology" className="about-methodology">
        <div>
          <p className="eyebrow">HOW TO READ DRISHTI</p>
          <h2>A guide to the records</h2>
          <p>Drishti is an index and analysis interface, not the original record holder. Use it to explore and compare; follow the source link when you need the complete document or the latest official revision.</p>
        </div>
        <ol className="about-method-list">
          <li><span>01</span><div><strong>Start with the source</strong><p>Publishers and source links are listed in the <Link href="/sources">public source registry</Link> and alongside records where available.</p></div></li>
          <li><span>02</span><div><strong>Check the reporting period</strong><p>Publication date, reporting year and live update time can mean different things. Read the labels and notes on each page.</p></div></li>
          <li><span>03</span><div><strong>Compare like with like</strong><p>Project figures may use different cost estimates, dates or progress measures. Notes explain known differences; unlike measures should not be treated as directly comparable.</p></div></li>
          <li><span>04</span><div><strong>Report a correction with evidence</strong><p>If a record looks wrong or its source has changed, send the page and supporting source to the <a href="https://github.com/Shubhamnpk/drishti/issues" target="_blank" rel="noreferrer">project issue tracker <ExternalLink size={12} /></a>.</p></div></li>
        </ol>
      </section>

      <section id="coverage" className="about-section">
        <div className="about-section-heading">
          <p className="eyebrow">COVERAGE AND FRESHNESS</p>
          <h2>What moves, and how often.</h2>
          <p>Each family below is pulled from a public endpoint and cached on the server. Live figures refresh on the cadence shown; published records change only when the issuing body revises them.</p>
        </div>
        <div className="about-cadence">
          <div className="about-cadence-head" aria-hidden="true">
            <span>Coverage</span><span>Publisher</span><span>Refresh</span>
          </div>
          {cadence.map(([label, source, refresh, live]) => (
            <div className="about-cadence-row" key={label}>
              <strong>{label}</strong>
              <span>{source}</span>
              <span className={live ? 'about-badge live' : 'about-badge'}>{refresh}</span>
            </div>
          ))}
        </div>
        <p className="about-cadence-note">
          Daily means the server re-checks the publisher once a day. On publication means the figure changes only when the issuing body releases a new report, so a census table can sit unchanged for years. A slow or unavailable publisher shows as an empty state, never as a zero. The <Link href="/sources">source registry</Link> lists every endpoint and its update time.
        </p>
      </section>

      <section className="about-explore">
        <div className="about-section-heading">
          <p className="eyebrow">EXPLORE</p>
          <h2>Follow the public record across Nepal</h2>
        </div>
        <div className="about-area-grid">
          {areas.map(([href, title, description]) => (
            <Link href={href} className="about-area-link" key={href}>
              <span><strong>{title}</strong><small>{description}</small></span>
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className="about-section">
        <div className="about-section-heading">
          <p className="eyebrow">QUESTIONS</p>
          <h2>Straight answers</h2>
          <p>The short version of what Drishti is, what it is not, and how to check it.</p>
        </div>
        <div className="about-faq">
          {faqs.map(item => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="project" className="about-section">
        <div className="about-section-heading">
          <p className="eyebrow">THE PROJECT</p>
          <h2>Independent, open source, open to correction.</h2>
        </div>
        <div className="about-project-grid">
          {projectFacts.map(fact => (
            <article className="about-project-card" key={fact.title}>
              <h3>{fact.title}</h3>
              <p>{fact.text}</p>
            </article>
          ))}
        </div>
        <div className="about-project-links">
          <a href="https://github.com/Shubhamnpk/drishti/issues" target="_blank" rel="noreferrer">Report an issue <ExternalLink size={12} /></a>
          <a href="https://github.com/Shubhamnpk/drishti/blob/main/LICENSE" target="_blank" rel="noreferrer">Read the MIT licence <ExternalLink size={12} /></a>
          <Link href="/releases">Release history <ArrowRight size={12} /></Link>
        </div>
      </section>

      <div className="about-open-source">
        <div><strong>Built in the open.</strong><span>Drishti is an open-source project. Explore the code, report an issue or help improve the public record.</span></div>
        <a href="https://github.com/Shubhamnpk/drishti" target="_blank" rel="noreferrer" className="outline-button">View project on GitHub <ExternalLink size={14} /></a>
      </div>
    </main>
  )
}
