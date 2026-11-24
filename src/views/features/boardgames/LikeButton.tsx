import { useLike } from '../../../controllers/useLike'
import type { Boardgame } from '../../../models/boardgame'
import { HeartIcon } from '../../components/Icons/Icons'
import { cx } from '../../utils/classNames'
import './LikeButton.css'

type LikeButtonProps = {
  game: Boardgame
  /** overlay: no canto da capa (cards); inline: ao lado de outras ações (modal) */
  variant?: 'overlay' | 'inline'
  className?: string
}

/** Coração de curtir, com o total. Sem login, abre a modal de entrar. */
export function LikeButton({ game, variant = 'overlay', className }: LikeButtonProps) {
  const { likedByMe, likeCount, busy, toggle } = useLike(game)

  return (
    <button
      type="button"
      className={cx('like-button', `like-button--${variant}`, likedByMe && 'is-liked', className)}
      aria-pressed={likedByMe}
      aria-label={`${likedByMe ? 'Descurtir' : 'Curtir'} ${game.name} (${likeCount} ${likeCount === 1 ? 'curtida' : 'curtidas'})`}
      title={likedByMe ? 'Descurtir' : 'Curtir'}
      disabled={busy}
      onClick={(e) => {
        // Nos cards, o clique não pode abrir os detalhes do jogo
        e.stopPropagation()
        void toggle()
      }}
    >
      <HeartIcon filled={likedByMe} />
      <span className="like-button__count" aria-hidden="true">
        {likeCount}
      </span>
    </button>
  )
}
