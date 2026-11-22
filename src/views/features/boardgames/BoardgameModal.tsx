import { useState, type ReactNode } from 'react'
import type { Boardgame } from '../../../models/boardgame'
import { readUserId } from '../../../models/session'
import { Button } from '../../components/Button/Button'
import { CalendarIcon, ClockIcon, UsersIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
import { GameMarket } from '../market/GameMarket'
import { BoardgameForm } from './BoardgameForm'
import { CategoryTag } from './CategoryTag'
import { GameCover } from './GameCover'
import './BoardgameModal.css'

type Fact = { icon: ReactNode; value: string; label: string }

/** Só as informações que o jogo tem; as vazias não aparecem */
function facts(game: Boardgame): Fact[] {
  const list: Fact[] = []
  if (game.playerNumber) {
    list.push({ icon: <UsersIcon />, value: String(game.playerNumber), label: game.playerNumber === 1 ? 'jogador' : 'jogadores' })
  }
  if (game.playTime) list.push({ icon: <ClockIcon />, value: String(game.playTime), label: 'minutos' })
  if (game.releaseYear) list.push({ icon: <CalendarIcon />, value: String(game.releaseYear), label: 'lançamento' })
  return list
}

type BoardgameModalProps = {
  game: Boardgame
  onClose: () => void
  /** Chamado depois de editar o jogo, para a lista de trás se atualizar */
  onChanged?: () => void
}

/** Detalhes de um jogo do feed: capa, números principais e a descrição completa */
export function BoardgameModal({ game: initial, onClose, onChanged }: BoardgameModalProps) {
  const [game, setGame] = useState(initial)
  const [editing, setEditing] = useState(false)
  const items = facts(game)

  if (editing) {
    return (
      <Modal open onClose={() => setEditing(false)} title="Editar jogo" lead={game.name}>
        <BoardgameForm
          game={game}
          onCancel={() => setEditing(false)}
          onSaved={(saved) => {
            setGame(saved)
            setEditing(false)
            onChanged?.()
          }}
        />
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose} title={game.name} size="lg" media={<GameCover id={game.id} name={game.name} />}>
      <CategoryTag game={game} className="boardgame-modal__category" />

      {items.length > 0 && (
        <dl className="boardgame-modal__facts">
          {items.map((fact) => (
            <div key={fact.label} className="boardgame-modal__fact">
              {fact.icon}
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <section className="boardgame-modal__about" aria-labelledby="boardgame-modal-about">
        <h3 id="boardgame-modal-about">Sobre o jogo</h3>
        <p className={game.description ? undefined : 'boardgame-modal__empty'}>
          {game.description || 'Este jogo ainda não tem descrição.'}
        </p>
      </section>

      {readUserId() && (
        <Button variant="link" onClick={() => setEditing(true)}>
          Editar jogo
        </Button>
      )}

      <GameMarket boardgameId={game.id} />
    </Modal>
  )
}
