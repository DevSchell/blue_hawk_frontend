import { useState } from 'react'
import { useAsyncList } from '../../../controllers/useAsyncList'
import { useMatchesController } from '../../../controllers/useMatchesController'
import type { MyMatch } from '../../../models/services/matchesService'
import { listShelf } from '../../../models/services/shelfService'
import { Alert } from '../../components/Alert/Alert'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Modal } from '../../components/Modal/Modal'
import { ACCOUNT_ROUTES } from '../../layout/navigation'
import '../FeedPage/FeedPage.css'
import '../ShelfPage/ShelfPage.css'
import '../AccountPages.css'

type Controller = ReturnType<typeof useMatchesController>

/** Minhas Partidas: as que o usuário criou e as de que participa */
export function MatchesPage({ onSignIn }: { onSignIn: () => void }) {
  const ctrl = useMatchesController()
  const [creating, setCreating] = useState(false)

  if (!ctrl.signedIn) {
    return (
      <main className="feed-page">
        <Container>
          <h1 className="feed-page__title">Minhas Partidas</h1>
          <EmptyState icon={<Raven variant="noite" />} title="Entre para ver as suas partidas">
            Crie partidas e entre nas de outros jogadores.
            <span className="shelf-empty__action">
              <Button onClick={onSignIn}>Entrar</Button>
            </span>
          </EmptyState>
        </Container>
      </main>
    )
  }

  return (
    <main className="feed-page">
      <Container>
        <h1 className="feed-page__title">Minhas Partidas</h1>
        <div className="shelf-toolbar">
          <Button className="shelf-toolbar__end" onClick={() => setCreating(true)}>Nova partida</Button>
        </div>
        {ctrl.actionError && <Alert title="Ops" tone="warn" size="sm">{ctrl.actionError}</Alert>}
        {ctrl.error ? (
          <Alert title="Não deu para carregar" tone="warn" action={<Button variant="link" onClick={ctrl.retry}>Tentar de novo</Button>}>
            Verifique a conexão e tente outra vez.
          </Alert>
        ) : ctrl.loading && ctrl.matches.length === 0 ? (
          <p className="shelf-status" aria-busy="true">Carregando partidas…</p>
        ) : ctrl.matches.length === 0 ? (
          <EmptyState icon={<Raven variant="noite" />} title="Você ainda não tem partidas">
            Crie uma partida com um jogo da sua estante, ou peça para entrar numa partida pela página do jogo na Wiki.
          </EmptyState>
        ) : (
          <ul className="match-list">
            {ctrl.matches.map((item) => (
              <MatchCard key={item.match.id} item={item} ctrl={ctrl} />
            ))}
          </ul>
        )}
      </Container>
      {creating && <NewMatchModal userId={ctrl.userId!} onCreate={ctrl.create} onClose={() => setCreating(false)} />}
    </main>
  )
}

function MatchCard({ item, ctrl }: { item: MyMatch; ctrl: Controller }) {
  const { match, game, hostId, hostName, players } = item
  const isHost = hostId === ctrl.userId
  const mine = players.find((p) => p.userId === ctrl.userId)
  const [busy, setBusy] = useState(false)

  async function guard(action: () => Promise<unknown>) {
    setBusy(true)
    try {
      await action()
    } catch {
      /* o aviso aparece no topo da lista */
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="match-card">
      <div className="match-card__head">
        <h2 className="match-card__title">{game.name}</h2>
        <span className="match-card__tag">{isHost ? 'Você é o anfitrião' : `Anfitrião: ${hostName}`}</span>
      </div>
      <span className="match-card__meta">
        {match.maxUsers ? `${players.length} de ${match.maxUsers} jogadores` : `${players.length} ${players.length === 1 ? 'jogador' : 'jogadores'}`}
      </span>
      {players.length > 0 && (
        <ul className="match-card__players">
          {players.map((player) => (
            <li key={player.id}>
              <span>
                {player.name}
                {player.userId === hostId ? ' (anfitrião)' : ''}
                {player.userId === ctrl.userId ? ' · você' : ''}
              </span>
              {isHost && player.userId !== ctrl.userId && (
                <Button variant="link" disabled={busy} onClick={() => guard(() => ctrl.kick(player.id))}>Remover</Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="match-card__actions">
        {!isHost && mine && (
          <Button variant="secondary" disabled={busy} onClick={() => guard(() => ctrl.leave(mine.id))}>Sair da partida</Button>
        )}
        {isHost && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              if (window.confirm(`Cancelar a partida de “${game.name}”? Os jogadores serão retirados.`)) void guard(() => ctrl.cancel(match.id))
            }}
          >
            Cancelar partida
          </Button>
        )}
      </div>
    </li>
  )
}

function NewMatchModal({ userId, onCreate, onClose }: { userId: string; onCreate: (copyId: string) => Promise<unknown>; onClose: () => void }) {
  const shelf = useAsyncList((signal) => listShelf(userId, signal))
  const [creating, setCreating] = useState<string | null>(null)
  const [error, setError] = useState(false)

  async function create(copyId: string) {
    setCreating(copyId)
    setError(false)
    try {
      await onCreate(copyId)
      onClose()
    } catch {
      setError(true)
      setCreating(null)
    }
  }

  const items = shelf.data ?? []

  return (
    <Modal open onClose={onClose} title="Nova partida" lead="Escolha um jogo da sua estante." size="lg">
      {error && <Alert tone="warn" size="sm" title="Ops">Não deu para criar a partida. Tente de novo.</Alert>}
      {shelf.error ? (
        <Alert tone="warn" size="sm" title="Não deu para carregar">Tente de novo em instantes.</Alert>
      ) : shelf.loading ? (
        <p className="shelf-status">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="shelf-status">
          Sua estante está vazia. <a href={ACCOUNT_ROUTES.shelf}>Adicione jogos</a> para criar partidas.
        </p>
      ) : (
        <ul className="shelf-pick">
          {items.map((item) => (
            <li key={item.copy.id} className="shelf-pick__row">
              <span>{item.game.name}</span>
              <Button variant="secondary" disabled={creating !== null} onClick={() => create(item.copy.id)}>
                {creating === item.copy.id ? 'Criando…' : 'Criar partida'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
