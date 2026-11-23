import { useState, useSyncExternalStore } from 'react'
import { getUserAvatar } from '../../../models/session'
import { cx } from '../../utils/classNames'
import './Avatar.css'
import { getAvatarSizeClass, initials, type AvatarSize } from './avatarUtils'

type AvatarProps = {
  name: string
  size?: AvatarSize
  photoUrl?: string | null
  userId?: string
  className?: string
}

function subscribeToAvatarChanges(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('bluehawk:avatar-changed', callback)
  return () => window.removeEventListener('bluehawk:avatar-changed', callback)
}

/** Iniciais do nome ou foto num polígono Blue Hawk. Decorativo: o nome deve aparecer em texto ao lado ou no rótulo. */
export function Avatar({ name, size = 'md', photoUrl, userId, className }: AvatarProps) {
  const storedPhoto = useSyncExternalStore(
    subscribeToAvatarChanges,
    () => getUserAvatar(userId),
    () => null
  )
  const [imgError, setImgError] = useState(false)

  const effectivePhoto = photoUrl !== undefined ? photoUrl : storedPhoto

  return (
    <span className={cx('avatar', getAvatarSizeClass(size), className)} aria-hidden="true">
      {effectivePhoto && !imgError ? (
        <img
          src={effectivePhoto}
          alt={name}
          className="avatar__img"
          onError={() => setImgError(true)}
        />
      ) : (
        initials(name)
      )}
    </span>
  )
}
