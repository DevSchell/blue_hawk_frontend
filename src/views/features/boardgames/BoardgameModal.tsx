import type { ReactNode } from 'react'
import type { Boardgame } from '../../../models/boardgame'
import { CalendarIcon, ClockIcon, UsersIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
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
}

/** Detalhes de um jogo do feed: capa, números principais e a descrição completa */
export function BoardgameModal({ game, onClose }: BoardgameModalProps) {
  const items = facts(game)

  return (
    <Modal open onClose={onClose} title={game.name} size="lg" media={<GameCover id={game.id} name={game.name} />}>
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
    </Modal>
  )
}
