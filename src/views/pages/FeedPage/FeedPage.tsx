import { useState } from 'react'
import { useFeedController } from '../../../controllers/useFeedController'
import { readIsAdmin } from '../../../models/session'
import { BoardScene } from '../../components/Brand/BoardScene'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { Hero } from '../../components/Hero/Hero'
import { PlusIcon } from '../../components/Icons/Icons'
import { SearchField } from '../../components/SearchField/SearchField'
import { BoardgameFeed } from '../../features/boardgames/BoardgameFeed'
import { BoardgameFormModal } from '../../features/boardgames/BoardgameFormModal'
import { CategoryTiles } from '../../features/boardgames/CategoryTiles'
import { MostLiked } from '../../features/boardgames/MostLiked'
import { categoryPath, gamePath } from '../../layout/navigation'
import { navigate } from '../../layout/router'
import './FeedPage.css'

/**
 * Página inicial: hero com a busca, o ranking, os quadros de categoria e o feed de jogos
 * (cada jogo abre a página dele; cada categoria, a página da categoria).
 */
export function FeedPage() {
  const { search, setSearch, query, feed, isEmpty } = useFeedController()
  const browsing = !query
  const isAdmin = readIsAdmin()
  const [creating, setCreating] = useState(false)
  const title = query ? `Resultados para “${query}”` : 'Jogos'

  return (
    <>
      <Hero
        title="Toda mesa começa com um bom jogo."
        lead="Descubra boardgames para a sua próxima noite de jogo."
        art={<BoardScene />}
      >
        <div className="hero__search-row">
          <SearchField
            id="busca"
            label="Buscar jogo pelo nome"
            placeholder="Ex.: Marés de Ferro"
            value={search}
            onChange={setSearch}
          />
          {/* Só admin cadastra direto na Wiki (a API confere o papel); usuários sugerem jogos pela estante */}
          {isAdmin && (
            <Button type="button" className="hero__search-action" onClick={() => setCreating(true)}>
              <PlusIcon />
              <span>Cadastrar jogo</span>
            </Button>
          )}
        </div>
      </Hero>

      <main className="feed-page">
        <Container>
          {/* Ranking e categorias só sem busca, para não empurrar os resultados para baixo */}
          {browsing && <MostLiked />}
          {browsing && (
            <CategoryTiles
              title="Explore por categoria"
              lead="Do jogo de estratégia pesado à festa com os amigos."
              hrefFor={categoryPath}
            />
          )}
          <div className="feed-page__heading" id="jogos">
            <h2 className="feed-page__title">{title}</h2>
          </div>
          <BoardgameFeed feed={feed} query={query} isEmpty={isEmpty} />
        </Container>
      </main>

      {creating && (
        <BoardgameFormModal
          isAdmin
          onSaved={(saved) => {
            setCreating(false)
            navigate(gamePath(saved.id))
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  )
}
