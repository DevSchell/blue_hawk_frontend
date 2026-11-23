import { useState, useSyncExternalStore } from 'react'
import type { Boardgame } from '../models/boardgame'
import { likesStore } from '../models/likesStore'
import { requestLogin } from '../models/loginPrompt'
import { readUserId } from '../models/session'
import { likeBoardgame, unlikeBoardgame } from '../models/services/boardgameService'

/**
 * Curtida de um jogo. Atualiza na hora (otimista) e desfaz se a API recusar.
 * O estado vai para o likesStore, então o mesmo jogo fica igual no card, na modal e no ranking.
 */
export function useLike(game: Boardgame) {
  const override = useSyncExternalStore(likesStore.subscribe, () => likesStore.get(game.id))
  const state = override ?? { likeCount: game.likeCount ?? 0, likedByMe: game.likedByMe ?? false }
  const [busy, setBusy] = useState(false)

  async function toggle() {
    if (!readUserId()) {
      requestLogin()
      return
    }
    if (busy) return
    const previous = state
    const next = {
      likedByMe: !previous.likedByMe,
      likeCount: Math.max(0, previous.likeCount + (previous.likedByMe ? -1 : 1)),
    }
    likesStore.set(game.id, next)
    setBusy(true)
    try {
      const result = next.likedByMe ? await likeBoardgame(game.id) : await unlikeBoardgame(game.id)
      likesStore.set(game.id, { likeCount: result.likeCount, likedByMe: result.likedByMe })
    } catch {
      likesStore.set(game.id, previous)
    } finally {
      setBusy(false)
    }
  }

  return { ...state, busy, toggle }
}
