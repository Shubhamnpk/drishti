'use client'

import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'

export type SearchFilterOption = { value: string; label: string }
export type SearchFilter = {
  id: string
  label: string
  value: string
  options: SearchFilterOption[]
  onChange: (value: string) => void
}

type Props = {
  query: string
  onQueryChange: (value: string) => void
  placeholder: string
  filters: SearchFilter[]
  hasActiveFilters?: boolean
  onClear?: () => void
  trailing?: ReactNode
  className?: string
}

/** Shared, always-visible search and select filters for directory pages. */
export function SearchFilterBar({ query, onQueryChange, placeholder, filters, hasActiveFilters = false, onClear, trailing, className = '' }: Props) {
  return (
    <div className={`search-filter-bar ${className}`.trim()}>
      <label className="search-filter-input">
        <Search size={17} aria-hidden="true" />
        <input aria-label={placeholder} placeholder={placeholder} value={query} onChange={event => onQueryChange(event.target.value)} />
        {query && <button type="button" aria-label="Clear search text" onClick={() => onQueryChange('')}><X size={15} /></button>}
      </label>
      {filters.map(filter => (
        <label className="search-filter-select" key={filter.id}>
          <span>{filter.label}</span>
          <select aria-label={filter.label} value={filter.value} onChange={event => filter.onChange(event.target.value)}>
            {filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      ))}
      {trailing}
      {hasActiveFilters && onClear && <button className="search-filter-clear" type="button" onClick={onClear}>Clear filters <X size={14} /></button>}
    </div>
  )
}
