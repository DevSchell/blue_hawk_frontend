import { useState } from 'react'
import { useBoardgameFeed } from '../../../controllers/useBoardgameFeed'
import { useDebouncedValue } from '../../../controllers/useDebouncedValue'
import { Container } from '../../components/Container/Container'
import { SearchField } from '../../components/SearchField/SearchField'
import { BoardgameFeed } from '../../features/boardgames/BoardgameFeed'
import { CategoryHeader } from '../../features/boardgames/CategoryHeader'
import { storeCategoryPath } from '../../layout/navigation'
import './CategoryPage.css'

/** Página de uma categoria na Wiki: cabeçalho com a arte, busca dentro da categoria e os jogos dela */
export function CategoryPage({ category }: { category: string }) {
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 350)
  const feed = useBoardgameFeed(query, category)
  const isEmpty = !feed.loadingFirstPage && !feed.error && feed.items.length === 0

  return (
    <>
      <CategoryHeader
        name={category}
        section={{ label: 'Wiki', href: '/' }}
        title={category}
        lead={
          <>
            Todos os jogos de {category.toLowerCase()} da Wiki.{' '}
            <a className="category-page__link" href={storeCategoryPath(category)}>
              Ver {category.toLowerCase()} à venda na Loja
            </a>
          </>
        }
        backFallback="/"
      />

      <main className="category-page">
        <Container>
          <div className="category-page__tools">
            <SearchField
              id="busca-categoria"
              label={`Buscar em ${category}`}
              placeholder="Nome do jogo"
              value={search}
              onChange={setSearch}
            />
          </div>
          <BoardgameFeed feed={feed} query={query} isEmpty={isEmpty} />
        </Container>
      </main>
    </>
  )
}
