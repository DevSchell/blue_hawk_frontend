import { useState } from 'react'
import { useFeedController } from '../../../controllers/useFeedController'
import { readIsAdmin, readUserId } from '../../../models/session'
import { BoardScene } from '../../components/Brand/BoardScene'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { Hero } from '../../components/Hero/Hero'
import { SearchField } from '../../components/SearchField/SearchField'
import { BoardgameFeed } from '../../features/boardgames/BoardgameFeed'
import { BoardgameFormModal } from '../../features/boardgames/BoardgameFormModal'
import { BoardgameModal } from '../../features/boardgames/BoardgameModal'
import { MostLiked } from '../../features/boardgames/MostLiked'
import './FeedPage.css'

/** Página inicial: hero com a busca, o ranking, o feed de jogos e a modal de detalhes */
export function FeedPage() {
  const { search, setSearch, query, feed, isEmpty, selectedGame, openGame, closeGame } = useFeedController()
  const [creating, setCreating] = useState(false)

  return (
    <>
      <Hero
        title="Toda mesa começa com um bom jogo."
        lead="Descubra boardgames para a sua próxima noite de jogo."
        art={<BoardScene />}
      >
        <SearchField
          id="busca"
          label="Buscar jogo pelo nome"
          placeholder="Ex.: Marés de Ferro"
          value={search}
          onChange={setSearch}
        />
      </Hero>

      <main className="feed-page">
        <Container>
          {/* O ranking só aparece sem busca, para não empurrar os resultados para baixo */}
          {!query && <MostLiked onOpenGame={openGame} />}
          <h2 className="feed-page__title">{query ? `Resultados para “${query}”` : 'Jogos'}</h2>
          {readUserId() && (
            <div className="feed-page__actions">
              <Button onClick={() => setCreating(true)}>Cadastrar jogo</Button>
            </div>
          )}
          <BoardgameFeed feed={feed} query={query} isEmpty={isEmpty} onOpenGame={openGame} />
        </Container>
      </main>

      {/* key: trocar de jogo remonta a modal, que volta ao topo */}
      {selectedGame && (
        <BoardgameModal key={selectedGame.id} game={selectedGame} onClose={closeGame} onChanged={feed.refresh} />
      )}
      {/* Usuário comum: o jogo entra em aprovação e já vai para a estante; admin: direto no catálogo */}
      {creating && (
        <BoardgameFormModal
          isAdmin={readIsAdmin()}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            feed.refresh()
          }}
        />
      )}
    </>
  )
}
