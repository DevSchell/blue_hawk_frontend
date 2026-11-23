import { useState, type ReactNode } from 'react'
import type { Boardgame } from '../../../models/boardgame'
import { addToShelf } from '../../../models/services/shelfService'
import { readUserId } from '../../../models/session'
import { Button } from '../../components/Button/Button'
import { CalendarIcon, ClockIcon, UsersIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
import { GameMarket } from '../market/GameMarket'
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
}

/** Detalhes de um jogo do feed: capa, números principais e a descrição completa */
export function BoardgameModal({ game, onClose }: BoardgameModalProps) {
  const items = facts(game)
  const userId = readUserId()
  const [shelfStatus, setShelfStatus] = useState<'idle' | 'saving' | 'added' | 'error'>('idle')

  const handleAddToShelf = async () => {
    if (!userId || shelfStatus === 'saving' || shelfStatus === 'added') return
    setShelfStatus('saving')
    try {
      await addToShelf(userId, game.id)
      setShelfStatus('added')
    } catch {
      setShelfStatus('error')
    }
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

      {userId && (
        <div className="boardgame-modal__actions">
          <Button
            type="button"
            variant={shelfStatus === 'added' ? 'secondary' : 'primary'}
            disabled={shelfStatus === 'saving' || shelfStatus === 'added'}
            onClick={handleAddToShelf}
          >
            {shelfStatus === 'saving'
              ? 'Adicionando...'
              : shelfStatus === 'added'
                ? 'Adicionado à estante!'
                : shelfStatus === 'error'
                  ? 'Erro ao adicionar — tentar de novo'
                  : 'Adicionar à estante'}
          </Button>
        </div>
      )}

      <GameMarket boardgameId={game.id} />
    </Modal>
  )
}
