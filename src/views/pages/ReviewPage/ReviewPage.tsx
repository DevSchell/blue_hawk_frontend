import { useId } from 'react'
import { useReviewQueueController, type ReviewTab } from '../../../controllers/useReviewQueueController'
import { REJECT_REASON_MAX, type Boardgame } from '../../../models/boardgame'
import { Alert } from '../../components/Alert/Alert'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import { PillTabs } from '../../components/PillTabs/PillTabs'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { FeedError } from '../../features/boardgames/FeedError'
import { formatPlayers } from '../../features/boardgames/format'
import { GameCover } from '../../features/boardgames/GameCover'
import './ReviewPage.css'
import { coverOf } from '../../../models/services/boardgameService'
import { FormActions } from '../../components/FormActions/FormActions'

const TABS: { id: ReviewTab; label: string }[] = [
  { id: 'PENDING', label: 'Pendentes' },
  { id: 'REJECTED', label: 'Recusados' },
]

type ReviewPageProps = {
  onSignIn: () => void
}

/** Fila de aprovação do admin: jogos cadastrados por usuários que ainda não estão na Wiki */
export function ReviewPage({ onSignIn }: ReviewPageProps) {
  const c = useReviewQueueController()

  if (!c.signedIn || !c.isAdmin) {
    return (
      <main className="page">
        <Container>
          <EmptyState
            icon={<Raven variant="noite" />}
            title={c.signedIn ? 'Área dos admins' : 'Entre para continuar'}
            action={
              !c.signedIn && (
                <div className="review-page__empty-action">
                  <Button type="button" onClick={onSignIn}>
                    Cadastrar / Entrar
                  </Button>
                </div>
              )
            }
          >
            {c.signedIn
              ? 'Só admins aprovam os jogos enviados para a Wiki. Os jogos que você cadastra ficam na sua estante.'
              : 'A aprovação de jogos é feita por admins. Entre com uma conta de admin para ver a fila.'}
          </EmptyState>
        </Container>
      </main>
    )
  }

  return (
    <main className="page">
      <Container>
        <PageHeader
          title="Aprovação de jogos"
          lead="Jogos cadastrados pelos usuários. Aprovados entram na Wiki; recusados ficam só na estante de quem enviou."
        />

        <PillTabs
          label="Situação dos jogos"
          tabs={TABS.map((t) => ({ ...t, badge: c.tab === t.id && !c.loading ? c.games.length : undefined }))}
          value={c.tab}
          onChange={c.selectTab}
        />

        <div aria-live="polite">
          {c.notice && (
            <div className="review-page__notice">
              <Alert tone={c.notice.tone} size="sm" title={c.notice.tone === 'info' ? 'Pronto' : 'Algo deu errado'}>
                {c.notice.text}
              </Alert>
            </div>
          )}
        </div>

        {c.loading ? (
          <LoadingCard message="Carregando a fila…" />
        ) : c.error ? (
          <FeedError error={c.error} onRetry={c.retry} />
        ) : c.games.length === 0 ? (
          <EmptyState icon={<Raven variant="noite" />} title={c.tab === 'PENDING' ? 'Fila vazia' : 'Nenhum recusado'}>
            {c.tab === 'PENDING'
              ? 'Nenhum jogo aguardando aprovação. Quando alguém cadastrar um, ele aparece aqui.'
              : 'Nenhum jogo foi recusado.'}
          </EmptyState>
        ) : (
          <ul className="review-list">
            {c.games.map((game) => (
              <ReviewItem key={game.id} game={game} c={c} />
            ))}
          </ul>
        )}
      </Container>
    </main>
  )
}

function ReviewItem({ game, c }: { game: Boardgame; c: ReturnType<typeof useReviewQueueController> }) {
  const reasonId = useId()
  const busy = c.busyId === game.id
  const rejecting = c.rejectingId === game.id
  const facts = [
    game.playerNumber ? formatPlayers(game.playerNumber) : null,
    game.playTime ? `${game.playTime} min` : null,
    game.releaseYear ? String(game.releaseYear) : null,
  ].filter(Boolean)

  return (
    <li className="review-item">
      <div className="review-item__cover">
        <GameCover id={game.id} name={game.name} {...coverOf(game)} />
      </div>

      <div className="review-item__body">
        <h2 className="review-item__name">{game.name}</h2>
        {facts.length > 0 && <p className="review-item__facts">{facts.join(' · ')}</p>}
        <p className="review-item__description">{game.description}</p>
        <p className="review-item__author">Enviado por {c.authorName(game)}</p>
        {game.approvalStatus === 'REJECTED' && game.reviewNote && (
          <p className="review-item__note">Motivo da recusa: “{game.reviewNote}”</p>
        )}

        {rejecting ? (
          <div className="review-item__reject">
            <label htmlFor={reasonId}>Motivo (opcional, aparece para quem enviou)</label>
            <textarea
              id={reasonId}
              rows={2}
              maxLength={REJECT_REASON_MAX}
              placeholder="Ex.: já existe na Wiki como “Catan”"
              value={c.rejectReason}
              onChange={(e) => c.setRejectReason(e.target.value)}
              autoFocus
            />
            <FormActions onCancel={c.cancelReject} busy={busy}>
              <Button type="button" disabled={busy} onClick={() => c.confirmReject(game)}>
                {busy ? 'Recusando…' : 'Confirmar recusa'}
              </Button>
            </FormActions>
          </div>
        ) : (
          <div className="review-item__actions">
            <Button type="button" disabled={busy} onClick={() => c.approve(game)}>
              {busy ? 'Salvando…' : 'Aprovar'}
            </Button>
            {game.approvalStatus !== 'REJECTED' && (
              <Button type="button" variant="secondary" disabled={busy} onClick={() => c.startReject(game)}>
                Recusar
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
