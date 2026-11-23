import { usePlayController, type PlayTab } from '../../../controllers/usePlayController'
import { BoardScene } from '../../components/Brand/BoardScene'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Hero } from '../../components/Hero/Hero'
import { PlusIcon } from '../../components/Icons/Icons'
import { SearchField } from '../../components/SearchField/SearchField'
import { FeedError } from '../../features/boardgames/FeedError'
import { HostMatchModal } from '../../features/play/HostMatchModal'
import { JoinMatchModal } from '../../features/play/JoinMatchModal'
import { JoinRequestsModal } from '../../features/play/JoinRequestsModal'
import { MatchCard } from '../../features/play/MatchCard'
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
        <div className="play-hero__actions">
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
          <Button type="button" className="play-hero__host" onClick={c.signedIn ? c.openHost : onSignIn}>
            <PlusIcon />
            <span>{c.signedIn ? 'Hospedar partida' : 'Entre para hospedar'}</span>
          </Button>
        </div>
      </Hero>

      <main className="play-page">
        <Container>
          {c.signedIn && (
            <div role="tablist" aria-label="Quais partidas mostrar" className="play-page__tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={c.tab === tab.id}
                  className="play-page__tab"
                  onClick={() => c.selectTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <h2 className="play-page__title">
            {c.tab === 'minhas'
              ? 'Minhas partidas'
              : c.cityQuery
                ? `Partidas em “${c.cityQuery}”`
                : 'Próximas partidas'}
          </h2>

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
                />
              ))}
            </div>
          )}
        </Container>
      </main>

      {c.joining && <JoinMatchModal key={c.joining.id} match={c.joining} onJoined={c.joined} onClose={c.closeJoin} />}
      {c.isHosting && <HostMatchModal onHosted={c.hosted} onClose={c.closeHost} />}
      {c.managing && <JoinRequestsModal key={c.managing.id} match={c.managing} onClose={c.closeRequests} />}

      <div className="play-toast" aria-live="polite">
        {c.toast && <span>{c.toast}</span>}
      </div>
    </>
  )
}
