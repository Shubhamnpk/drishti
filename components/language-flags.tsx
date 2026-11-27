type FlagProps = { size?: number; className?: string }

export function NepalFlag({ size = 18, className }: FlagProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="M3 2.5 19.5 9.2 3 9.2Z" fill="#DC143C" stroke="#003893" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M3 9.2 19.5 15.9 3 15.9Z" fill="#DC143C" stroke="#003893" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M3 9.2h16.5L3 2.5Z" fill="none" stroke="#fff" strokeWidth="0.7" strokeLinejoin="round" opacity=".9" />
      <circle cx="8.4" cy="6.1" r="1.5" fill="#fff" />
      <circle cx="7.4" cy="6.6" r="1.5" fill="#DC143C" />
      <circle cx="8.6" cy="12.4" r="1.1" fill="#fff" />
      <circle cx="7.8" cy="12.8" r="1.1" fill="#DC143C" />
    </svg>
  )
}

export function UkFlag({ size = 18, className }: FlagProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect width="24" height="24" rx="2" fill="#012169" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#fff" strokeWidth="5" />
      <path d="M0 0 24 24M24 0 0 24" stroke="#C8102E" strokeWidth="2" />
      <path d="M12 0v24M0 12h24" stroke="#fff" strokeWidth="7" />
      <path d="M12 0v24M0 12h24" stroke="#C8102E" strokeWidth="4" />
      <rect width="24" height="24" rx="2" fill="none" stroke="#00000022" strokeWidth="1" />
    </svg>
  )
}

export function LanguageBadge({ code }: { code: 'ne' | 'en' }) {
  return code === 'ne' ? <NepalFlag size={16} /> : <UkFlag size={16} />
}
