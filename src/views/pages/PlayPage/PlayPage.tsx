import { usePlayController, type PlayTab } from '../../../controllers/usePlayController'
import { BoardScene } from '../../components/Brand/BoardScene'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Hero } from '../../components/Hero/Hero'
import { PlusIcon } from '../../components/Icons/Icons'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import { PillTabs } from '../../components/PillTabs/PillTabs'
import { SearchField } from '../../components/SearchField/SearchField'
import { FeedError } from '../../features/boardgames/FeedError'
import { CancelMatchModal } from '../../features/play/CancelMatchModal'
import { HostMatchModal } from '../../features/play/HostMatchModal'
import { JoinMatchModal } from '../../features/play/JoinMatchModal'
import { JoinRequestsModal } from '../../features/play/JoinRequestsModal'
import { MatchCard } from '../../features/play/MatchCard'
import { MatchRow } from '../../features/play/MatchRow'
import './PlayPage.css'

const TABS: { id: PlayTab; label: string }[] = [
  { id: 'abertas', label: 'Partidas abertas' },
  { id: 'minhas', label: 'Minhas partidas' },
]

/** "Jogue": matchmaking. Encontre uma mesa (e peça para entrar) ou hospede uma com um jogo seu. */
export function PlayPage({ onSignIn }: { onSignIn: () => void }) {
  const c = usePlayController()

  return (
    <>
      <Hero
        title="Bora jogar?"
        lead="Encontre uma mesa perto de você e peça para entrar, ou abra a sua com um jogo da estante."
        art={<BoardScene />}
      >
        <div className="hero__search-row">
          <SearchField
            id="cidade"
            label="Buscar partidas por cidade"
            placeholder="Ex.: Blumenau"
            value={c.city}
            onChange={(value) => {
              c.setCity(value)
              if (c.tab !== 'abertas') c.selectTab('abertas')
            }}
          />
          <Button type="button" className="hero__search-action" onClick={c.signedIn ? c.openHost : onSignIn}>
            <PlusIcon />
            <span>{c.signedIn ? 'Hospedar partida' : 'Entre para hospedar'}</span>
          </Button>
        </div>
      </Hero>

      <main className="page">
        <Container>
          {c.signedIn && <PillTabs label="Quais partidas mostrar" tabs={TABS} value={c.tab} onChange={c.selectTab} />}

          <PageHeader
            level={2}
            title={
              c.tab === 'minhas'
                ? 'Minhas partidas'
                : c.cityQuery
                  ? `Partidas em “${c.cityQuery}”`
                  : 'Próximas partidas'
            }
          />

          <p className="visually-hidden" aria-live="polite">
            {c.loading ? 'Carregando partidas' : `${c.matches.length} partidas`}
          </p>

          {c.loading ? (
            <div className="play-grid" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="play-grid__skeleton" />
              ))}
            </div>
          ) : c.error ? (
            <FeedError error={c.error} onRetry={c.retry} />
          ) : c.matches.length === 0 ? (
            <EmptyState
              icon={<Raven variant="noite" />}
              title={c.tab === 'minhas' ? 'Nenhuma partida por aqui' : 'Nenhuma mesa aberta'}
              action={
                <div className="play-page__empty-action">
                  <Button type="button" onClick={c.signedIn ? c.openHost : onSignIn}>
                    Hospedar partida
                  </Button>
                </div>
              }
            >
              {c.tab === 'minhas'
                ? 'Você ainda não hospeda nem pediu para entrar em nenhuma partida.'
                : c.cityQuery
                  ? 'Ninguém abriu partida nessa cidade ainda. Que tal ser o primeiro?'
                  : 'Ninguém abriu partida ainda. Que tal ser o primeiro?'}
            </EmptyState>
          ) : c.tab === 'minhas' ? (
            <ul className="match-list">
              {c.matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  signedIn={c.signedIn}
                  busy={c.busyId === match.id}
                  onSignIn={onSignIn}
                  onJoin={c.openJoin}
                  onWithdraw={c.withdraw}
                  onOpenRequests={c.openRequests}
                  onCancel={c.cancel}
                  onOpen={c.openMatch}
                />
              ))}
            </ul>
          ) : (
            <div className="play-grid">
              {c.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  signedIn={c.signedIn}
                  busy={c.busyId === match.id}
                  onSignIn={onSignIn}
                  onJoin={c.openJoin}
                  onWithdraw={c.withdraw}
                  onOpenRequests={c.openRequests}
                  onCancel={c.cancel}
                  onOpen={c.openMatch}
                />
              ))}
            </div>
          )}
        </Container>
      </main>

      {c.joining && <JoinMatchModal key={c.joining.id} match={c.joining} onJoined={c.joined} onClose={c.closeJoin} />}
      {c.isHosting && <HostMatchModal onHosted={c.hosted} onClose={c.closeHost} />}
      {c.withdrawing && (
        <ConfirmModal
          title="Desistir da partida?"
          lead={c.withdrawing.game?.name ?? 'Partida'}
          confirmLabel="Desistir"
          busyLabel="Saindo…"
          onConfirm={c.confirmWithdraw}
          onClose={c.closeWithdraw}
        >
          Sua vaga é liberada e {c.withdrawing.host.name} é avisado. Para voltar, você precisa pedir de novo.
        </ConfirmModal>
      )}
      {c.cancelling && (
        <CancelMatchModal
          key={c.cancelling.id}
          match={c.cancelling}
          onCancelled={c.cancelled}
          onClose={c.closeCancel}
        />
      )}
      {c.managing && <JoinRequestsModal key={c.managing.id} match={c.managing} onClose={c.closeRequests} />}

      <div className="play-toast" aria-live="polite">
        {c.toast && <span>{c.toast}</span>}
      </div>
    </>
  )
}
