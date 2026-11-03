import { FEED_PAGE_SIZE, type BoardgameFeedState } from '../../../controllers/useBoardgameFeed'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FeedError } from './FeedError'
import { GameCard } from './GameCard'
import { GameCardSkeleton } from './GameCardSkeleton'
import { GameGrid } from './GameGrid'
import './BoardgameFeed.css'

type BoardgameFeedProps = {
  feed: BoardgameFeedState
  /** Busca em vigor, para a mensagem de lista vazia */
  query: string
  isEmpty: boolean
}

/** Lista de jogos com seus estados: carregando, vazio, erro e "carregar mais" */
export function BoardgameFeed({ feed, query, isEmpty }: BoardgameFeedProps) {
  const hasError = feed.error !== null

  return (
    <>
      <p className="visually-hidden" aria-live="polite">
        {feed.loadingFirstPage ? 'Carregando jogos' : `${feed.items.length} jogos na lista`}
      </p>

      {hasError && feed.items.length === 0 && <FeedError error={feed.error} onRetry={feed.retry} />}

      {isEmpty && (
        <EmptyState
          icon={<Raven variant="noite" />}
          title={query ? 'Nenhum jogo com esse nome' : 'Nenhum jogo por aqui ainda'}
        >
          {query ? 'Tente outra palavra ou limpe a busca.' : 'Volte em breve: a estante está sendo montada.'}
        </EmptyState>
      )}

      <GameGrid busy={feed.loadingFirstPage}>
        {feed.loadingFirstPage
          ? Array.from({ length: FEED_PAGE_SIZE / 2 }, (_, i) => <GameCardSkeleton key={i} />)
          : feed.items.map((game) => <GameCard key={game.id} game={game} />)}
      </GameGrid>

      {hasError && feed.items.length > 0 && (
        <div className="boardgame-feed__error">
          <FeedError error={feed.error} onRetry={feed.retry} />
        </div>
      )}

      {!feed.loadingFirstPage && !hasError && feed.hasMore && (
        <div className="boardgame-feed__more">
          <Button onClick={feed.loadMore} disabled={feed.loadingMore}>
            {feed.loadingMore ? 'Carregando…' : 'Carregar mais jogos'}
          </Button>
        </div>
      )}
    </>
  )
}
