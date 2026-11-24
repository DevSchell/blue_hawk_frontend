import type { ReactNode } from 'react'
import { approvalStatusOf, type Boardgame } from '../../../models/boardgame'
import type { ShelfGame } from '../../../models/shelf'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { CalendarIcon, ClockIcon, UsersIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
import { CategoryTag } from '../boardgames/CategoryTag'
import { GameCover } from '../boardgames/GameCover'
import { PLAY_PATH } from '../../layout/navigation'
import './ShelfGameModal.css'
import { coverOf } from '../../../models/services/boardgameService'

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
  togglingSale: boolean
  removingGame: boolean
  onClose: () => void
  /** Abre a modal de venda, onde o preço é informado */
  onAnnounceSale: () => void
  onRemoveSale: () => void
  onRemoveFromShelf: () => void
  /** Abre a correção de um jogo que o usuário cadastrou e ainda não foi aprovado */
  onEditGame: (game: Boardgame) => void
}

export function ShelfGameModal({
  game,
  togglingSale,
  removingGame,
  onClose,
  onAnnounceSale,
  onRemoveSale,
  onRemoveFromShelf,
  onEditGame,
}: ShelfGameModalProps) {
  const items = facts(game)
  const { boardgame } = game
  const status = approvalStatusOf(boardgame)
  // Só o autor recebe o jogo não aprovado da API, então quem o vê aqui pode corrigi-lo
  const editButton = (
    <Button type="button" variant="secondary" onClick={() => onEditGame(boardgame)}>
      {status === 'REJECTED' ? 'Corrigir e reenviar' : 'Editar dados'}
    </Button>
  )

  return (
    <Modal
      open
      onClose={onClose}
      title={boardgame.name}
      size="lg"
      media={<GameCover id={boardgame.id} name={boardgame.name} {...coverOf(boardgame)} />}
    >
      <div className="shelf-modal__top-meta">
        <CategoryTag game={boardgame} />
        {boardgame.publisher && <span className="badge shelf-modal__publisher">{boardgame.publisher}</span>}
        {game.forSale && <span className="badge shelf-modal__sale-tag">À venda • R$ {game.salePrice}</span>}
      </div>

      {status === 'PENDING' && (
        <div className="shelf-modal__review">
          <Alert tone="info" size="sm" title="Aguardando aprovação" action={editButton}>
            Só você vê este jogo por enquanto. Ele entra na Wiki quando um admin aprovar; até lá, não pode ser
            anunciado na loja.
          </Alert>
        </div>
      )}
      {status === 'REJECTED' && (
        <div className="shelf-modal__review">
          <Alert tone="warn" size="sm" title="Recusado para a Wiki" action={editButton}>
            O jogo continua na sua estante, mas não entrou no catálogo.
            {boardgame.reviewNote && (
              <span className="shelf-modal__review-note">Motivo: “{boardgame.reviewNote}”</span>
            )}
          </Alert>
        </div>
      )}

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

      {/* Partidas contam só quando feitas pelo Jogue (host ou pedido aceito, já realizadas) */}
      <div className="shelf-modal__plays-bar">
        <div className="shelf-modal__plays-info">
          <span>Partidas pelo Jogue:</span>
          <strong>
            {game.plays} {game.plays === 1 ? 'partida' : 'partidas'} • {game.hours}h jogadas
          </strong>
        </div>
        {status === 'APPROVED' && (
          <a className="button button--primary shelf-modal__play-link" href={PLAY_PATH}>
            Marcar partida
          </a>
        )}
      </div>

      <div className="shelf-modal__actions">
        {status === 'APPROVED' &&
          (game.forSale ? (
            <Button type="button" variant="secondary" disabled={togglingSale} onClick={onRemoveSale}>
              {togglingSale ? 'Removendo...' : 'Remover anúncio da loja'}
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={onAnnounceSale}>
              Anunciar venda
            </Button>
          ))}

        <Button type="button" variant="secondary" disabled={removingGame} onClick={onRemoveFromShelf}>
          {removingGame ? 'Removendo...' : 'Remover da estante'}
        </Button>
      </div>
    </Modal>
  )
}
