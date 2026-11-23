import { useEffect, useRef } from 'react'
import { useShelfController } from '../../../controllers/useShelfController'
import { SHELF_CATEGORIES, type PlayersFilterOption, type ShelfSortOption } from '../../../models/shelf'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { CloseIcon, D20Icon, PlusIcon, UsersIcon } from '../../components/Icons/Icons'
import { BoardgameFormModal } from '../../features/boardgames/BoardgameFormModal'
import { FeedError } from '../../features/boardgames/FeedError'
import { GameCardSkeleton } from '../../features/boardgames/GameCardSkeleton'
import { cx } from '../../utils/classNames'
import { AddGameModal } from '../../features/shelf/AddGameModal'
import { SaleModal } from '../../features/shelf/SaleModal'
import { ShelfGameCard } from '../../features/shelf/ShelfGameCard'
import { ShelfGameModal } from '../../features/shelf/ShelfGameModal'
import { ShelfPodium } from '../../features/shelf/ShelfPodium'
import './ShelfPage.css'

type ShelfPageProps = {
  onGoToFeed: () => void
  onSignIn: () => void
}

export function ShelfPage({ onGoToFeed, onSignIn }: ShelfPageProps) {
  const {
    signedIn,
    games,
    filteredGames,
    podiumGames,
    summary,
    categoryCounts,
    loading,
    error,
    retry,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectCategory,
    onlyForSale,
    toggleForSale,
    playersFilter,
    setPlayersFilter,
    sortBy,
    setSortBy,
    resetFilters,
    selectedGame,
    openGame,
    closeGame,
    removeSaleForSelected,
    openSaleForSelected,
    saleGame,
    saleError,
    confirmSale,
    closeSale,
    togglingSale,
    removeSelectedFromShelf,
    removingGame,
    isRollingD20,
    litGameId,
    altLitGameId,
    winnerGameId,
    startD20Roulette,
    clearRouletteWinner,
    toasts,
    isAdmin,
    gameForm,
    openCreateGame,
    isAddGameOpen,
    ownedBoardgameIds,
    openAddGame,
    closeAddGame,
    handleWikiGameAdded,
    openEditGame,
    closeGameForm,
    handleGameSaved,
  } = useShelfController()

  const gridRef = useRef<HTMLDivElement>(null)
  const winnerGame = winnerGameId ? games.find((g) => g.userBoardgameId === winnerGameId) ?? null : null

  useEffect(() => {
    if (!winnerGameId || !gridRef.current) return
    const card = gridRef.current.querySelector(`[data-game-id="${winnerGameId}"]`)
    if (card instanceof HTMLElement) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [winnerGameId])

  // Deslogado: a estante não tem dados para mostrar, então a página é só o convite para entrar.
  if (!signedIn) {
    return (
      <main className="shelf-page">
        <Container>
          <EmptyState
            icon={<Raven variant="noite" />}
            title="Entre para ver sua estante"
            action={
              <div className="shelf-empty-action">
                <Button type="button" variant="primary" onClick={onSignIn}>
                  Cadastrar / Entrar
                </Button>
              </div>
            }
          >
            Faça login ou crie sua conta para montar sua coleção, registrar partidas e anunciar jogos.
          </EmptyState>
        </Container>
      </main>
    )
  }

  return (
    <>
      <section aria-labelledby="estante-bar-heading" className="shelf-bar">
        <Container>
          <div className="shelf-bar__inner">
            <div className="shelf-bar__title-group">
              <span className="shelf-bar__accent" aria-hidden="true" />
              <div>
                <h1 id="estante-bar-heading" className="shelf-bar__title">
                  Sua estante
                </h1>
                <p className="shelf-bar__subtitle">Biblioteca pessoal • Coleção verificada</p>
              </div>
            </div>

            <div className="shelf-bar__stats">
              <div className="shelf-stat" title="Total de jogos adquiridos">
                <span className="shelf-stat__label">Jogos:</span>
                <span className="shelf-stat__value">{summary.totalGames}</span>
                <span className="shelf-stat__extra">
                  ({summary.totalPlays} {summary.totalPlays === 1 ? 'partida' : 'partidas'})
                </span>
              </div>

              <div className="shelf-stat" title="Horas estimadas jogadas na mesa">
                <span className="shelf-stat__label">Horas:</span>
                <span className="shelf-stat__value">{summary.totalHours}h</span>
              </div>

              <div className="shelf-stat" title="Categoria mais presente nas partidas">
                <span className="shelf-stat__label">Top categoria:</span>
                <span className="shelf-stat__value shelf-stat__value--text">{summary.topCategory}</span>
              </div>

              <button
                type="button"
                onClick={toggleForSale}
                title="Clique para filtrar apenas os jogos à venda"
                className="shelf-stat shelf-stat--sale"
              >
                <span className="shelf-stat__label shelf-stat__label--accent">À venda:</span>
                <span className="shelf-stat__value">{summary.forSaleCount}</span>
                {summary.forSaleCount > 0 && <span className="shelf-stat__extra">(R$ {summary.forSaleTotalValue})</span>}
              </button>
            </div>
          </div>
        </Container>
      </section>

      {!loading && !error && <ShelfPodium games={podiumGames} onOpenGame={openGame} />}

      <main className="shelf-page">
        <Container>
          <section aria-label="Pesquisa, filtros e ordenação da estante" className="shelf-controls">
            <div className="shelf-controls__header">
              <div className="shelf-controls__heading-wrap">
                <h2 className="shelf-controls__title">Jogos na estante</h2>
                <p className="shelf-controls__counter">
                  Exibindo {filteredGames.length} de {games.length} jogos adquiridos
                  {onlyForSale ? ' • Apenas à venda' : ''}
                  {selectedCategory !== 'Todas' ? ` • ${selectedCategory}` : ''}
                </p>
              </div>

              <div className="shelf-controls__header-actions">
                <Button type="button" variant="secondary" className="shelf-add-game-btn" onClick={openAddGame}>
                  <PlusIcon />
                  <span>Adicionar jogo</span>
                </Button>

                <button
                  type="button"
                  onClick={startD20Roulette}
                  disabled={isRollingD20 || filteredGames.length === 0}
                  title="Sortear jogo com D20"
                  aria-label="Sortear jogo com D20"
                  className={cx(
                    'shelf-d20-btn',
                    isRollingD20 && 'shelf-d20-btn--rolling',
                    // Quique de "parada" quando o sorteio termina
                    !isRollingD20 && winnerGameId && 'shelf-d20-btn--landed',
                  )}
                >
                  <span className="shelf-d20-btn__die" aria-hidden="true">
                    <D20Icon className="shelf-d20-btn__icon" />
                  </span>
                  <span>{isRollingD20 ? 'Rolando…' : 'Sortear'}</span>
                </button>
              </div>
            </div>

            <div className="shelf-controls__toolbar">
              <form className="shelf-search" role="search" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="shelf-search-input" className="visually-hidden">
                  Buscar jogo na estante pelo nome
                </label>
                <input
                  id="shelf-search-input"
                  type="search"
                  autoComplete="off"
                  placeholder="Buscar jogo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Limpar pesquisa"
                    className="shelf-search__clear"
                    onClick={() => setSearchQuery('')}
                  >
                    <CloseIcon />
                  </button>
                )}
              </form>

              <button
                type="button"
                onClick={toggleForSale}
                aria-pressed={onlyForSale}
                className={`shelf-sale-toggle ${onlyForSale ? 'shelf-sale-toggle--active' : ''}`}
              >
                <span className="shelf-sale-toggle__dot" aria-hidden="true" />
                <span>À venda ({summary.forSaleCount})</span>
              </button>

              <div role="tablist" aria-label="Filtrar por categoria" className="shelf-categories">
                {SHELF_CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category
                  const count = categoryCounts[category] ?? 0
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectCategory(category)}
                      className={`shelf-category-pill ${isActive ? 'shelf-category-pill--active' : ''}`}
                    >
                      {category} <span className="shelf-category-pill__count">({count})</span>
                    </button>
                  )
                })}
              </div>

              <div className="shelf-controls__selects">
                <div className="shelf-select">
                  <label htmlFor="shelf-players-select" className="visually-hidden">
                    Filtrar por quantidade de jogadores
                  </label>
                  <span className="shelf-select__prefix" aria-hidden="true">
                    <UsersIcon />
                    <span>Mesa:</span>
                  </span>
                  <select
                    id="shelf-players-select"
                    value={playersFilter}
                    onChange={(e) => setPlayersFilter(e.target.value as PlayersFilterOption)}
                  >
                    <option value="any">Todos</option>
                    <option value="1">Solo (1)</option>
                    <option value="2">2 jog.</option>
                    <option value="3-4">3–4 jog.</option>
                    <option value="5+">5+ jog.</option>
                  </select>
                </div>

                <div className="shelf-select">
                  <label htmlFor="shelf-sort-select" className="visually-hidden">
                    Ordenar jogos por
                  </label>
                  <span className="shelf-select__prefix" aria-hidden="true">
                    <span>Ordenar:</span>
                  </span>
                  <select
                    id="shelf-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as ShelfSortOption)}
                  >
                    <option value="most-played">Mais jogadas</option>
                    <option value="most-hours">Mais horas</option>
                    <option value="az">A–Z</option>
                    <option value="za">Z–A</option>
                    <option value="duration-asc">Mais rápidas</option>
                  </select>
                </div>
              </div>
            </div>

            {winnerGame && (
              <div className="shelf-winner-banner" role="status">
                <div className="shelf-winner-banner__text">
                  <span className="shelf-winner-banner__badge">D20 Sorteou</span>
                  <strong>“{winnerGame.boardgame.name}” foi o jogo sorteado para a mesa!</strong>
                </div>
                <div className="shelf-winner-banner__actions">
                  <Button type="button" variant="primary" onClick={() => openGame(winnerGame)}>
                    Ver detalhes do jogo
                  </Button>
                  <Button type="button" variant="secondary" onClick={clearRouletteWinner}>
                    Limpar
                  </Button>
                </div>
              </div>
            )}
          </section>

          <p className="visually-hidden" aria-live="polite">
            {loading ? 'Carregando sua estante' : `${filteredGames.length} jogos exibidos na estante`}
          </p>

          {loading ? (
            <div className="shelf-grid" aria-busy="true">
              {Array.from({ length: 4 }, (_, index) => (
                <GameCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <FeedError error={error} onRetry={retry} />
          ) : games.length === 0 ? (
            <EmptyState
              icon={<Raven variant="noite" />}
              title="Sua estante está vazia"
              action={
                <div className="shelf-empty-action">
                  <Button type="button" variant="primary" onClick={openAddGame}>
                    Adicionar jogo
                  </Button>
                  <Button type="button" variant="secondary" onClick={onGoToFeed}>
                    Explorar a Wiki
                  </Button>
                </div>
              }
            >
              Escolha jogos da Wiki para montar sua coleção. Não achou o seu? Dá para cadastrá-lo.
            </EmptyState>
          ) : filteredGames.length === 0 ? (
            <EmptyState
              icon={<Raven variant="noite" />}
              title="Nenhum jogo encontrado"
              action={
                <div className="shelf-empty-action">
                  <Button type="button" variant="primary" onClick={resetFilters}>
                    Limpar filtros e pesquisa
                  </Button>
                </div>
              }
            >
              Não encontramos títulos na sua estante com os filtros ou termos pesquisados.
            </EmptyState>
          ) : (
            <div ref={gridRef} className="shelf-grid">
              {filteredGames.map((game) => (
                <ShelfGameCard
                  key={game.userBoardgameId}
                  game={game}
                  isLit={litGameId === game.userBoardgameId}
                  isAltLit={altLitGameId === game.userBoardgameId}
                  isWinner={winnerGameId === game.userBoardgameId}
                  onOpen={openGame}
                />
              ))}
            </div>
          )}
        </Container>
      </main>

      {selectedGame && (
        <ShelfGameModal
          key={selectedGame.userBoardgameId}
          game={selectedGame}
          togglingSale={togglingSale}
          removingGame={removingGame}
          onClose={closeGame}
          onAnnounceSale={openSaleForSelected}
          onRemoveSale={removeSaleForSelected}
          onRemoveFromShelf={removeSelectedFromShelf}
          onEditGame={openEditGame}
        />
      )}

      {saleGame && (
        <SaleModal
          key={saleGame.userBoardgameId}
          game={saleGame}
          saving={togglingSale}
          error={saleError}
          onConfirm={confirmSale}
          onClose={closeSale}
        />
      )}

      {isAddGameOpen && (
        <AddGameModal
          ownedIds={ownedBoardgameIds}
          onAdded={handleWikiGameAdded}
          onCreateNew={openCreateGame}
          onClose={closeAddGame}
        />
      )}

      {gameForm && (
        <BoardgameFormModal
          key={gameForm === 'create' ? 'create' : gameForm.id}
          game={gameForm === 'create' ? null : gameForm}
          isAdmin={isAdmin}
          onSaved={handleGameSaved}
          onClose={closeGameForm}
        />
      )}

      <div className="shelf-toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="shelf-toast">
            <span className="shelf-toast__dot" aria-hidden="true" />
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </>
  )
}
