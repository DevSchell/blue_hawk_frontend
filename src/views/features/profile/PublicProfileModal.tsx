import { useEffect, useState } from 'react'
import { apiUrl } from '../../../models/services/apiClient'
import { avatarImageOf, getPublicProfile } from '../../../models/services/userProfileService'
import { storeOfferHref } from '../../../models/store'
import { levelLabel, splitGenres, type PublicProfile } from '../../../models/userProfile'
import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { MapPinIcon } from '../../components/Icons/Icons'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { Modal } from '../../components/Modal/Modal'
import { ACCOUNT_ROUTES } from '../../layout/navigation'
import { GameCover } from '../boardgames/GameCover'
import { formatPrice } from '../store/format'
import { navigate } from '../../layout/router'
import './PublicProfileModal.css'

const memberSince = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

/** Perfil público de um jogador: o que ele escolheu mostrar (bio, números, estante) */
export function PublicProfileModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [state, setState] = useState<{ profile: PublicProfile | null; error: boolean }>({ profile: null, error: false })

  useEffect(() => {
    const controller = new AbortController()
    getPublicProfile(userId, controller.signal)
      .then((profile) => setState({ profile, error: false }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ profile: null, error: true })
      })
    return () => controller.abort()
  }, [userId])

  const p = state.profile
  return (
    <Modal open onClose={onClose} size="lg" title={p?.name ?? 'Perfil do jogador'}>
      {state.error ? (
        <p className="public-profile__locked">Não deu para abrir este perfil agora.</p>
      ) : !p ? (
        <LoadingCard compact message="Abrindo o perfil…" />
      ) : (
        <ProfileBody profile={p} onClose={onClose} />
      )}
    </Modal>
  )
}

function ProfileBody({ profile: p, onClose }: { profile: PublicProfile; onClose: () => void }) {
  const level = levelLabel(p.profile?.experienceLevel ?? null)
  const genres = splitGenres(p.profile?.favoriteGenres)

  return (
    <div className="public-profile">
      <header className="public-profile__head">
        <Avatar name={p.name} size="xl" photoUrl={avatarImageOf(p)} />
        <div className="public-profile__who">
          <div className="public-profile__tags">
            <span className="badge public-profile__role">{p.role === 'ADMIN' ? 'Administrador' : 'Jogador'}</span>
            {level && <span className="badge public-profile__level">{level}</span>}
          </div>
          {p.profile?.city && (
            <span className="public-profile__city">
              <MapPinIcon />
              {p.profile.city}
            </span>
          )}
          {p.profile && (
            <span className="public-profile__since">
              No Blue Hawk desde {memberSince.format(new Date(p.profile.memberSince))}
            </span>
          )}
        </div>
      </header>

      {!p.isPublic && !p.isMe ? (
        <p className="public-profile__locked">
          {p.name} deixou o perfil privado. Dá para conversar pelas partidas e pela Loja, mas a bio, os números e a
          estante ficam escondidos.
        </p>
      ) : (
        <>
          {p.isMe && !p.isPublic && (
            <p className="public-profile__locked">Seu perfil está privado: os outros veem só seu nome e sua foto.</p>
          )}

          {(p.profile?.bio || genres.length > 0) && (
            <section className="public-profile__about" aria-label="Sobre">
              {p.profile?.bio && <blockquote className="public-profile__bio">{p.profile.bio}</blockquote>}
              {genres.length > 0 && (
                <ul className="public-profile__genres" aria-label="Jogos e estilos favoritos">
                  {genres.map((genre) => (
                    <li key={genre}>{genre}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {p.stats && (
            <ul className="public-profile__stats" aria-label="Números">
              <li>
                <b>{p.stats.games}</b>
                <span>Jogos na estante</span>
              </li>
              <li>
                <b>{p.stats.matchesPlayed}</b>
                <span>Partidas jogadas</span>
              </li>
              <li>
                <b>{p.stats.forSale}</b>
                <span>À venda</span>
              </li>
            </ul>
          )}

          <section aria-labelledby="public-profile-shelf">
            <h3 id="public-profile-shelf" className="public-profile__section-title">
              Estante
            </h3>
            {p.shelf === null ? (
              <p className="public-profile__muted">{p.name} preferiu não mostrar a estante.</p>
            ) : p.shelf.length === 0 ? (
              <p className="public-profile__muted">Nenhum jogo na estante ainda.</p>
            ) : (
              <ul className="public-profile__shelf">
                {p.shelf.map((game) => (
                  <li key={game.boardgameId} className="public-profile__game">
                    <div className="public-profile__cover">
                      <GameCover
                        id={game.boardgameId}
                        name={game.name}
                        preset={game.coverPreset}
                        imageUrl={game.coverImageUrl ? apiUrl(game.coverImageUrl) : null}
                      />
                      {game.offerId && game.price !== null && (
                        <a className="badge public-profile__sale" href={storeOfferHref(game.offerId)}>
                          À venda · {formatPrice(game.price)}
                        </a>
                      )}
                    </div>
                    <b className="public-profile__game-name">{game.name}</b>
                    {game.category && <span className="public-profile__game-cat">{game.category}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {p.isMe && (
        <div className="public-profile__me">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose()
              navigate(ACCOUNT_ROUTES.profile)
            }}
          >
            Editar meu perfil
          </Button>
        </div>
      )}
    </div>
  )
}
