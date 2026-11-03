import { useFeedController } from '../../../controllers/useFeedController'
import { BoardScene } from '../../components/Brand/BoardScene'
import { Container } from '../../components/Container/Container'
import { Hero } from '../../components/Hero/Hero'
import { SearchField } from '../../components/SearchField/SearchField'
import { BoardgameFeed } from '../../features/boardgames/BoardgameFeed'
import './FeedPage.css'

/** Página inicial: hero com a busca e o feed de jogos */
export function FeedPage() {
  const { search, setSearch, query, feed, isEmpty } = useFeedController()

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
          <h2 className="feed-page__title">{query ? `Resultados para “${query}”` : 'Jogos'}</h2>
          <BoardgameFeed feed={feed} query={query} isEmpty={isEmpty} />
        </Container>
      </main>
    </>
  )
}
