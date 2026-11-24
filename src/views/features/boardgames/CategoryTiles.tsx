import { useEffect, useState, type CSSProperties } from 'react'
import type { Category } from '../../../models/boardgame'
import { listCategories } from '../../../models/services/boardgameService'
import { HScroller } from '../../components/HScroller/HScroller'
import { CategoryArt } from './CategoryArt'
import './CategoryTiles.css'

type CategoryTilesProps = {
  title: string
  lead?: string
  /** Link de cada quadro (ex.: a Wiki ou a Loja filtrada pela categoria) */
  hrefFor: (category: string) => string
  /** Quantos itens há em cada categoria (opcional, aparece no quadro) */
  counts?: Record<string, number>
  countLabel?: (n: number) => string
}

/** "Explore por categoria": quadros com a arte e o nome de cada categoria */
export function CategoryTiles({ title, lead, hrefFor, counts, countLabel }: CategoryTilesProps) {
  const [categories, setCategories] = useState<Category[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    listCategories(controller.signal)
      .then(setCategories)
      .catch(() => setCategories([]))
    return () => controller.abort()
  }, [])

  if (categories !== null && categories.length === 0) return null

  return (
    <section className="category-tiles" aria-labelledby="category-tiles-title">
      <div className="category-tiles__head">
        <h2 id="category-tiles-title">{title}</h2>
        {lead && <p>{lead}</p>}
      </div>
      <HScroller label={title} columns="minmax(200px, 1fr)">
        {(categories ?? Array.from({ length: 6 }, (_, i) => ({ id: String(i), name: '' }))).map((category, i) => (
          <div key={category.id} className="category-tiles__cell" style={{ '--i': i } as CSSProperties}>
            {category.name ? (
              <a className="category-tile" href={hrefFor(category.name)}>
                <CategoryArt name={category.name} />
                <span className="category-tile__name">{category.name}</span>
                {counts && countLabel && (
                  <span className="category-tile__count">{countLabel(counts[category.name] ?? 0)}</span>
                )}
              </a>
            ) : (
              <span className="category-tile category-tile--skeleton" aria-hidden="true" />
            )}
          </div>
        ))}
      </HScroller>
    </section>
  )
}
