import { useEffect, useState } from 'react'
import { useGameMarket } from '../../../controllers/useGameMarket'
import type { Boardgame } from '../../../models/boardgame'
import { ApiError } from '../../../models/services/apiClient'
import { coverOf, getBoardgameById } from '../../../models/services/boardgameService'
import { addToShelf } from '../../../models/services/shelfService'
import { readIsAdmin, readUserId } from '../../../models/session'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { CheckIcon } from '../../components/Icons/Icons'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { BoardgameFormModal } from '../../features/boardgames/BoardgameFormModal'
import { CategoryTag } from '../../features/boardgames/CategoryTag'
import { formatPlayers } from '../../features/boardgames/format'
import { GameCover } from '../../features/boardgames/GameCover'
import { LikeButton } from '../../features/boardgames/LikeButton'
import { GameMarket } from '../../features/market/GameMarket'
import { categoryPath } from '../../layout/navigation'
import { BackButton } from '../../components/BackButton/BackButton'
import '../ProductPage.css'
import './GamePage.css'

/**
 * Página do jogo na Wiki (estilo página de produto): capa grande, ficha ao lado, a faixa com
 * estante e venda e, embaixo, a descrição, as ofertas na Loja e as partidas do Jogue.
 */
export function GamePage({ gameId }: { gameId: string }) {
  const [state, setState] = useState<{ game: Boardgame | null; error: unknown }>({ game: null, error: null })

  useEffect(() => {
    const controller = new AbortController()
    getBoardgameById(gameId, controller.signal)
      .then((game) => setState({ game, error: null }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ game: null, error })
      })
    return () => controller.abort()
  }, [gameId])

  if (state.error || (!state.game && state.error !== null)) {
    const missing = state.error instanceof ApiError && (state.error.status === 404 || state.error.status === 403)
    return (
      <main className="product-page">
        <Container>
          <EmptyState
            icon={<Raven variant="noite" />}
            title={missing ? 'Jogo não encontrado' : 'Não deu para abrir o jogo'}
            action={
              <div className="product-page__state">
                <a className="button button--primary" href="/">
                  Voltar à Wiki
                </a>
              </div>
            }
          >
            {missing ? 'Este jogo não está na Wiki.' : 'Verifique a conexão e tente de novo.'}
          </EmptyState>
        </Container>
      </main>
    )
  }

  if (!state.game) {
    return (
      <main className="product-page">
        <Container>
          <LoadingCard message="Abrindo o jogo…" />
        </Container>
      </main>
    )
  }

  return <GameContent key={state.game.id} initial={state.game} />
}

function GameContent({ initial }: { initial: Boardgame }) {
  const [game, setGame] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [isCreatingOffer, setIsCreatingOffer] = useState(false)
  const [shelfStatus, setShelfStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const userId = readUserId()
  const isAdmin = readIsAdmin()
  const market = useGameMarket(game.id)

  const handleAddToShelf = async () => {
    if (!userId || shelfStatus === 'saving' || market.ownsGame) return
    setShelfStatus('saving')
    try {
      await addToShelf(userId, game.id)
      setShelfStatus('idle')
      // Agora o jogo é do usuário: pode anunciar venda
      market.reload()
    } catch {
      setShelfStatus('error')
    }
  }

  const cheapest = market.offers.length > 0 ? Math.min(...market.offers.map((o) => Number(o.price))) : null

  return (
    <main className="product-page">
      <Container>
        <BackButton fallback="/" />
        <ol className="product-page__crumbs" aria-label="Você está em">
          <li>
            <a href="/">Wiki</a>
          </li>
          {game.category && (
            <li>
              <a href={categoryPath(game.category)}>{game.category}</a>
            </li>
          )}
          <li aria-current="page">{game.name}</li>
        </ol>

        <div className="product-page__title-row">
          <h1 className="product-page__title">{game.name}</h1>
          <LikeButton game={game} variant="inline" />
        </div>

        <div className="product-page__top">
          <div className="product-page__media">
            <GameCover id={game.id} name={game.name} {...coverOf(game)} />
          </div>

          <aside className="product-page__info" aria-label="Ficha do jogo">
            {game.description && <p className="product-page__summary">{game.description}</p>}
            <dl className="product-page__details">
              {game.releaseYear && (
                <>
                  <dt>Lançamento</dt>
                  <dd>{game.releaseYear}</dd>
                </>
              )}
              {game.playerNumber && (
                <>
                  <dt>Jogadores</dt>
                  <dd>{formatPlayers(game.playerNumber)}</dd>
                </>
              )}
              {game.playTime && (
                <>
                  <dt>Duração</dt>
                  <dd>{game.playTime} min</dd>
                </>
              )}
              <dt>Na Loja</dt>
              <dd>
                {market.signedIn && !market.loading
                  ? market.offers.length === 0
                    ? 'nenhuma oferta agora'
                    : `${market.offers.length} ${market.offers.length === 1 ? 'oferta' : 'ofertas'}`
                  : '—'}
              </dd>
            </dl>
            <div className="product-page__tags">
              <CategoryTag game={game} />
            </div>
          </aside>
        </div>

        <section className="product-page__action" aria-labelledby="na-sua-mesa">
          <div>
            <h2 id="na-sua-mesa">{market.ownsGame ? `${game.name} está na sua estante` : `Tem ${game.name}?`}</h2>
            <p className="product-page__action-sub">
              {market.ownsGame
                ? 'Anuncie na Loja ou abra uma partida no Jogue.'
                : cheapest !== null
                  ? `Na Loja a partir de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cheapest)}.`
                  : 'Adicione à estante para registrar partidas e anunciar.'}
            </p>
          </div>
          {userId ? (
            !market.loading &&
            !market.error && (
              <div className="product-page__buy">
                {market.ownsGame ? (
                  <span className="game-page__owned">
                    <CheckIcon />
                    Na sua estante
                  </span>
                ) : (
                  <Button type="button" disabled={shelfStatus === 'saving'} onClick={handleAddToShelf}>
                    {shelfStatus === 'saving'
                      ? 'Adicionando...'
                      : shelfStatus === 'error'
                        ? 'Erro ao adicionar — tentar de novo'
                        : 'Adicionar à estante'}
                  </Button>
                )}
                {/* Vender exige ter o jogo na estante */}
                {market.ownsGame &&
                  (market.hasMyOffer ? (
                    <span className="game-page__owned game-page__owned--sale">Venda anunciada</span>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isCreatingOffer}
                      onClick={() => setIsCreatingOffer(true)}
                    >
                      Anunciar venda
                    </Button>
                  ))}
                {/* Jogo do catálogo: só admin edita (a API recusa os demais) */}
                {isAdmin && (
                  <Button variant="link" onClick={() => setEditing(true)}>
                    Editar jogo
                  </Button>
                )}
              </div>
            )
          ) : null}
        </section>

        <section className="product-page__section game-page__about" aria-labelledby="sobre-jogo">
          <h2 id="sobre-jogo">Sobre o jogo</h2>
          <p>{game.description || 'Este jogo ainda não tem descrição.'}</p>
        </section>

        {/* Ofertas e partidas embaixo do "Sobre", lado a lado e da mesma altura */}
        <div className="game-page__market">
          <GameMarket market={market} isCreating={isCreatingOffer} onCloseCreate={() => setIsCreatingOffer(false)} />
        </div>
      </Container>

      {editing && (
        <BoardgameFormModal
          game={game}
          isAdmin={isAdmin}
          onClose={() => setEditing(false)}
          onSaved={(saved) => {
            setGame(saved)
            setEditing(false)
          }}
        />
      )}
    </main>
  )
}
