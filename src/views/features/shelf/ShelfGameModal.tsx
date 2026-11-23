import { useState, type ReactNode } from 'react'
import type { ShelfGame } from '../../../models/shelf'
import { Button } from '../../components/Button/Button'
import { CalendarIcon, ClockIcon, UsersIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
import { CategoryTag } from '../boardgames/CategoryTag'
import { GameCover } from '../boardgames/GameCover'
import './ShelfGameModal.css'

type Fact = { icon: ReactNode; value: string; label: string }

function facts(game: ShelfGame): Fact[] {
  const { boardgame } = game
  const list: Fact[] = []
  if (boardgame.playerNumber) {
    list.push({
      icon: <UsersIcon />,
      value: String(boardgame.playerNumber),
      label: boardgame.playerNumber === 1 ? 'jogador' : 'jogadores',
    })
  }
  if (boardgame.playTime) list.push({ icon: <ClockIcon />, value: String(boardgame.playTime), label: 'minutos' })
  if (boardgame.releaseYear) {
    list.push({ icon: <CalendarIcon />, value: String(boardgame.releaseYear), label: 'lançamento' })
  }
  return list
}

type ShelfGameModalProps = {
  game: ShelfGame
  registeringMatch: boolean
  togglingSale: boolean
  removingGame: boolean
  onClose: () => void
  onRegisterMatch: () => void
  onToggleSale: (price?: number) => void
  onRemoveFromShelf: () => void
}

export function ShelfGameModal({
  game,
  registeringMatch,
  togglingSale,
  removingGame,
  onClose,
  onRegisterMatch,
  onToggleSale,
  onRemoveFromShelf,
}: ShelfGameModalProps) {
  const [priceInput, setPriceInput] = useState(String(game.salePrice))
  const items = facts(game)
  const { boardgame } = game

  return (
    <Modal
      open
      onClose={onClose}
      title={boardgame.name}
      size="lg"
      media={<GameCover id={boardgame.id} name={boardgame.name} />}
    >
      <div className="shelf-modal__top-meta">
        <CategoryTag game={boardgame} />
        {boardgame.publisher && <span className="shelf-modal__publisher">{boardgame.publisher}</span>}
        {game.forSale && <span className="shelf-modal__sale-tag">À venda • R$ {game.salePrice}</span>}
      </div>

      {items.length > 0 && (
        <dl className="shelf-modal__facts">
          {items.map((fact) => (
            <div key={fact.label} className="shelf-modal__fact">
              {fact.icon}
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <section className="shelf-modal__about" aria-labelledby="shelf-modal-about">
        <h3 id="shelf-modal-about">Sobre o jogo</h3>
        <p className={boardgame.description ? undefined : 'shelf-modal__empty'}>
          {boardgame.description || 'Este jogo ainda não tem descrição.'}
        </p>
      </section>

      <div className="shelf-modal__plays-bar">
        <div className="shelf-modal__plays-info">
          <span>Na sua estante:</span>
          <strong>
            {game.plays} {game.plays === 1 ? 'partida' : 'partidas'} • {game.hours}h jogadas
          </strong>
        </div>
        <Button type="button" variant="primary" disabled={registeringMatch} onClick={onRegisterMatch}>
          {registeringMatch ? 'Registrando...' : '+ Registrar partida'}
        </Button>
      </div>

      {!game.forSale && (
        <div className="shelf-modal__price-row">
          <label htmlFor="shelf-sale-price">Preço para anúncio na loja (R$)</label>
          <input
            id="shelf-sale-price"
            type="number"
            min={1}
            step={1}
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
          />
        </div>
      )}

      <div className="shelf-modal__actions">
        <Button
          type="button"
          variant={game.forSale ? 'secondary' : 'primary'}
          disabled={togglingSale}
          onClick={() => onToggleSale(Number(priceInput))}
        >
          {togglingSale
            ? 'Salvando...'
            : game.forSale
              ? 'Remover anúncio da loja'
              : `Anunciar à venda (R$ ${Number(priceInput) > 0 ? Math.round(Number(priceInput)) : game.salePrice})`}
        </Button>

        <Button type="button" variant="secondary" disabled={removingGame} onClick={onRemoveFromShelf}>
          {removingGame ? 'Removendo...' : 'Remover da estante'}
        </Button>
      </div>
    </Modal>
  )
}
