import { useState, type ReactNode } from 'react'
import type { Boardgame } from '../../../models/boardgame'
import { addToShelf } from '../../../models/services/shelfService'
import { readUserId } from '../../../models/session'
import { Button } from '../../components/Button/Button'
import { useGameMarket } from '../../../controllers/useGameMarket'
import { CalendarIcon, CheckIcon, ClockIcon, UsersIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
import { GameMarket } from '../market/GameMarket'
import { CategoryTag } from './CategoryTag'
import { GameCover } from './GameCover'
import { LikeButton } from './LikeButton'
import './BoardgameModal.css'
import { coverOf } from '../../../models/services/boardgameService'

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
  const market = useGameMarket(game.id)
  const [shelfStatus, setShelfStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [isCreatingOffer, setIsCreatingOffer] = useState(false)

  const handleAddToShelf = async () => {
    if (!userId || shelfStatus === 'saving' || market.ownsGame) return
    setShelfStatus('saving')
    try {
      await addToShelf(userId, game.id)
      setShelfStatus('idle')
      // Recarrega as cópias: agora o jogo é do usuário e ele pode anunciar venda
      market.reload()
    } catch {
      setShelfStatus('error')
    }
  }

  return (
    <Modal open onClose={onClose} title={game.name} size="lg" media={<GameCover id={game.id} name={game.name} {...coverOf(game)} />}>
      <div className="boardgame-modal__top">
        <CategoryTag game={game} className="boardgame-modal__category" />
        <LikeButton game={game} variant="inline" />
      </div>

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

      {/* Uma barra só para as ações do usuário com este jogo: estante e venda */}
      {userId && !market.loading && !market.error && (
        <div className="boardgame-modal__actions">
          {market.ownsGame ? (
            <span className="boardgame-modal__owned">
              <CheckIcon />
              Na sua estante
            </span>
          ) : (
            <Button type="button" disabled={shelfStatus === 'saving'} onClick={handleAddToShelf}>
              {shelfStatus === 'saving'
                ? 'Adicionando...'
                : shelfStatus === 'error'
                  ? 'Erro ao adicionar — tentar de novo'
                  : 'Adicionar à estante'}
            </Button>
          )}

          {/* Vender exige ter o jogo na estante */}
          {market.ownsGame &&
            (market.hasMyOffer ? (
              <span className="boardgame-modal__owned boardgame-modal__owned--sale">Venda anunciada</span>
            ) : (
              <Button
                type="button"
                variant="secondary"
                disabled={isCreatingOffer}
                onClick={() => setIsCreatingOffer(true)}
              >
                Anunciar venda
              </Button>
            ))}
        </div>
      )}

      <GameMarket market={market} isCreating={isCreatingOffer} onCloseCreate={() => setIsCreatingOffer(false)} />
    </Modal>
  )
}
