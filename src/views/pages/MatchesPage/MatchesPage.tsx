import { useMemo, useState } from 'react'
import { useMatchesController } from '../../../controllers/useMatchesController'
import type { MyMatch } from '../../../models/services/matchesService'
import { resolveMatchDate, resolveMatchDuration } from '../../../models/services/matchesService'
import { Alert } from '../../components/Alert/Alert'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { CalendarIcon, ClockIcon, GridIcon, ListIcon, UsersIcon } from '../../components/Icons/Icons'
import { SearchField } from '../../components/SearchField/SearchField'
import { CategoryTag } from '../../features/boardgames/CategoryTag'
import { formatMatchDate, formatMatchDuration } from '../../features/boardgames/format'
import { GameCover } from '../../features/boardgames/GameCover'
import { cx } from '../../utils/classNames'
import { MatchDetailModal } from './MatchDetailModal'
import '../FeedPage/FeedPage.css'
import '../ShelfPage/ShelfPage.css'
import '../AccountPages.css'
import './MatchesPage.css'

type MatchesPageProps = {
  onSignIn: () => void
}

type ViewMode = 'cards' | 'list'

/**
 * Minhas Partidas: tela adaptada exclusivamente para histórico de partidas do usuário.
 * Permite alternar entre visualização em cards e lista e inspecionar detalhes da partida via modal.
 */
export function MatchesPage({ onSignIn }: MatchesPageProps) {
  const ctrl = useMatchesController()
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [search, setSearch] = useState('')
  const [selectedMatch, setSelectedMatch] = useState<MyMatch | null>(null)

  // Filtra as partidas pelo nome do jogo
  const filteredMatches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ctrl.matches
    return ctrl.matches.filter((item) => item.game.name.toLowerCase().includes(q))
  }, [ctrl.matches, search])

  // Estatísticas do histórico
  const stats = useMemo(() => {
    const totalMinutes = ctrl.matches.reduce(
      (sum, item) => sum + resolveMatchDuration(item.match, item.game),
      0,
    )
    const uniqueGames = new Set(ctrl.matches.map((item) => item.game.id)).size
    const hours = Math.round(totalMinutes / 60)
    return {
      totalMatches: ctrl.matches.length,
      totalHours: hours > 0 ? `${hours}h` : `${totalMinutes} min`,
      uniqueGames,
    }
  }, [ctrl.matches])

  if (!ctrl.signedIn) {
    return (
      <main className="feed-page">
        <Container>
          <div className="matches-page__header-row">
            <div className="matches-page__title-group">
              <span className="matches-page__accent" aria-hidden="true" />
              <div>
                <h1 className="feed-page__title">Minhas Partidas</h1>
                <p className="matches-page__subtitle">Histórico de sessões e mesas de jogos</p>
              </div>
            </div>
          </div>
          <EmptyState icon={<Raven variant="noite" />} title="Entre para ver o seu histórico de partidas">
            Acesse sua conta para consultar suas partidas jogadas e registradas na plataforma.
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
        <div className="matches-page__header-row">
          <div className="matches-page__title-group">
            <span className="matches-page__accent" aria-hidden="true" />
            <div>
              <h1 className="feed-page__title">Minhas Partidas</h1>
              <p className="matches-page__subtitle">
                Histórico de partidas • Mesas registradas e finalizadas
              </p>
            </div>
          </div>

          {ctrl.matches.length > 0 && (
            <div className="matches-page__stats">
              <div className="shelf-stat" title="Total de partidas presentes no histórico">
                <span className="shelf-stat__label">Partidas:</span>
                <span className="shelf-stat__value">{stats.totalMatches}</span>
              </div>
              <div className="shelf-stat" title="Tempo total acumulado em mesa">
                <span className="shelf-stat__label">Tempo em mesa:</span>
                <span className="shelf-stat__value">{stats.totalHours}</span>
              </div>
              <div className="shelf-stat" title="Títulos de jogos diferentes no histórico">
                <span className="shelf-stat__label">Jogos:</span>
                <span className="shelf-stat__value">{stats.uniqueGames}</span>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar de visualização e filtro */}
        <div className="matches-toolbar">
          <div className="matches-toolbar__search">
            <SearchField
              id="matches-search"
              label="Buscar no histórico"
              placeholder="Buscar pelo nome do jogo..."
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className="matches-toolbar__actions">
            <span className="matches-toolbar__count">
              {filteredMatches.length} {filteredMatches.length === 1 ? 'partida' : 'partidas'}
            </span>

            <div className="matches-view-toggle" role="group" aria-label="Modo de visualização">
              <button
                type="button"
                className={cx('matches-view-btn', viewMode === 'cards' && 'matches-view-btn--active')}
                onClick={() => setViewMode('cards')}
                aria-pressed={viewMode === 'cards'}
                title="Visualização em cards"
              >
                <GridIcon />
                <span>Cards</span>
              </button>
              <button
                type="button"
                className={cx('matches-view-btn', viewMode === 'list' && 'matches-view-btn--active')}
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                title="Visualização em lista"
              >
                <ListIcon />
                <span>Lista</span>
              </button>
            </div>
          </div>
        </div>

        {ctrl.actionError && (
          <Alert title="Ops" tone="warn" size="sm">
            {ctrl.actionError}
          </Alert>
        )}

        {ctrl.error ? (
          <Alert
            title="Não deu para carregar"
            tone="warn"
            action={<Button variant="link" onClick={ctrl.retry}>Tentar de novo</Button>}
          >
            Verifique a conexão e tente outra vez.
          </Alert>
        ) : ctrl.loading && ctrl.matches.length === 0 ? (
          <p className="shelf-status" aria-busy="true">
            Carregando histórico de partidas…
          </p>
        ) : ctrl.matches.length === 0 ? (
          <EmptyState icon={<Raven variant="noite" />} title="Você ainda não possui partidas registradas">
            Quando você registrar partidas pela sua estante ou participar de mesas na comunidade, elas serão listadas neste histórico.
          </EmptyState>
        ) : filteredMatches.length === 0 ? (
          <EmptyState icon={<Raven variant="noite" />} title="Nenhuma partida encontrada">
            Nenhuma partida do seu histórico corresponde à pesquisa &quot;{search}&quot;. Tente outro termo ou limpe a busca.
          </EmptyState>
        ) : viewMode === 'cards' ? (
          <ul className="matches-cards-grid" aria-label="Histórico de partidas em cards">
            {filteredMatches.map((item) => (
              <MatchHistoryCard
                key={item.match.id}
                item={item}
                currentUserId={ctrl.userId}
                onSelect={setSelectedMatch}
              />
            ))}
          </ul>
        ) : (
          <ul className="matches-history-list" aria-label="Histórico de partidas em lista">
            {filteredMatches.map((item) => (
              <MatchHistoryRow
                key={item.match.id}
                item={item}
                currentUserId={ctrl.userId}
                onSelect={setSelectedMatch}
              />
            ))}
          </ul>
        )}
      </Container>

      {/* Modal de detalhes da partida selecionada */}
      {selectedMatch && (
        <MatchDetailModal
          item={selectedMatch}
          currentUserId={ctrl.userId}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </main>
  )
}

function MatchHistoryCard({
  item,
  currentUserId,
  onSelect,
}: {
  item: MyMatch
  currentUserId?: string | null
  onSelect: (item: MyMatch) => void
}) {
  const { match, game, hostId, hostName, players } = item
  const isHost = hostId === currentUserId
  const matchDate = resolveMatchDate(match)
  const duration = resolveMatchDuration(match, game)
  const formattedDuration = formatMatchDuration(duration)
  const formattedDate = formatMatchDate(matchDate)

  return (
    <li className="match-card-item">
      <article className="match-history-card">
        <div className="match-history-card__media">
          <GameCover id={game.id} name={game.name} />
          <span className="match-history-card__duration-badge" title="Duração estimada da partida">
            <ClockIcon /> {formattedDuration}
          </span>
        </div>

        <div className="match-history-card__body">
          <div className="match-history-card__header">
            <h2 className="match-history-card__title">
              <button
                type="button"
                className="match-history-card__title-btn"
                onClick={() => onSelect(item)}
                title={`Ver detalhes da partida de ${game.name}`}
              >
                {game.name}
              </button>
            </h2>

            <div className="match-history-card__tags">
              <CategoryTag game={game} />
              <span
                className={cx(
                  'match-history-card__role-tag',
                  isHost && 'match-history-card__role-tag--host',
                )}
              >
                {isHost ? 'Você foi o anfitrião' : `Anfitrião: ${hostName}`}
              </span>
            </div>
          </div>

          <div className="match-history-card__details">
            <div className="match-history-card__detail-row" title="Data da partida">
              <CalendarIcon />
              <span>{formattedDate}</span>
            </div>
            <div className="match-history-card__detail-row" title="Participantes da mesa">
              <UsersIcon />
              <span>{players.length} {players.length === 1 ? 'jogador' : 'jogadores'}</span>
            </div>
          </div>

          <div className="match-history-card__footer">
            <Button
              variant="secondary"
              className="button--full"
              onClick={() => onSelect(item)}
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      </article>
    </li>
  )
}

function MatchHistoryRow({
  item,
  currentUserId,
  onSelect,
}: {
  item: MyMatch
  currentUserId?: string | null
  onSelect: (item: MyMatch) => void
}) {
  const { match, game, hostId, hostName, players } = item
  const isHost = hostId === currentUserId
  const matchDate = resolveMatchDate(match)
  const duration = resolveMatchDuration(match, game)
  const formattedDuration = formatMatchDuration(duration)
  const formattedDate = formatMatchDate(matchDate)

  return (
    <li className="matches-history-row-item">
      <div
        className="match-history-row"
        onClick={() => onSelect(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(item)
          }
        }}
      >
        <div className="match-history-row__thumb">
          <GameCover id={game.id} name={game.name} />
        </div>

        <div className="match-history-row__main">
          <div className="match-history-row__title-group">
            <h2 className="match-history-row__title">{game.name}</h2>
            <CategoryTag game={game} />
          </div>
          <span className="match-history-row__host">
            {isHost ? 'Você foi o anfitrião' : `Anfitrião: ${hostName}`}
          </span>
        </div>

        <div className="match-history-row__meta">
          <div className="match-history-row__stat" title="Data da partida">
            <span className="match-history-row__stat-label">Data</span>
            <span className="match-history-row__stat-value">
              <CalendarIcon />
              {formattedDate}
            </span>
          </div>

          <div className="match-history-row__stat" title="Duração estimada da partida">
            <span className="match-history-row__stat-label">Duração</span>
            <span className="match-history-row__stat-value">
              <ClockIcon />
              {formattedDuration}
            </span>
          </div>

          <div className="match-history-row__stat" title="Jogadores participantes">
            <span className="match-history-row__stat-label">Jogadores</span>
            <span className="match-history-row__stat-value">
              <UsersIcon />
              {players.length}
            </span>
          </div>
        </div>

        <div className="match-history-row__action">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(item)
            }}
          >
            Ver detalhes
          </Button>
        </div>
      </div>
    </li>
  )
}
