import { parseArticleText } from '@/lib/article-text-parser'

type Props = { text: string; target: 'en' | 'ne' }

export function OriginalArticle({ text, target }: Props) {
  const blocks = parseArticleText(text, target)

  return (
    <section className="gov-original-result" aria-label={target === 'ne' ? 'Original Nepali article' : 'Original English article'} lang={target}>
      <div className="gov-original-body gov-translation-body">
        {blocks.map((block, index) => {
          if (block.type === 'heading') return <h3 className="gov-translation-heading" lang={target} key={`block-${index}`}>{block.lines.join(' ')}</h3>
          if (block.type === 'list') {
            const List = block.ordered ? 'ol' : 'ul'
            return <List className="gov-translation-list" lang={target} key={`block-${index}`}>{block.lines.map((line, lineIndex) => <li key={`item-${lineIndex}`}>{line}</li>)}</List>
          }
          return <p lang={target} key={`block-${index}`}>{block.lines.join(' ')}</p>
        })}
      </div>
    </section>
  )
}
