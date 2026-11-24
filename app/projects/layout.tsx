import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Nepal public infrastructure projects',
  description: 'Track budgets, reported progress, targets, contractors and evidence for Nepal’s national priority infrastructure projects.',
  path: '/projects',
})

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
