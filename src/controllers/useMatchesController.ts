import { useState } from 'react'
import { readUserId } from '../models/session'
import { createMatch, deleteMatch, listMyMatches, removeParticipant } from '../models/services/matchesService'
import { joinMatch } from '../models/services/marketService'
import { useAsyncList } from './useAsyncList'

/** Minhas partidas: criar, sair, cancelar (anfitrião) e tirar jogadores (anfitrião) */
export function useMatchesController() {
  const userId = readUserId()
  const list = useAsyncList((signal) => (userId ? listMyMatches(userId, signal) : Promise.resolve([])))
  const [actionError, setActionError] = useState<string | null>(null)

  async function run(action: () => Promise<unknown>, failure: string) {
    setActionError(null)
    try {
      await action()
      list.reload()
    } catch {
      setActionError(failure)
      throw new Error(failure)
    }
  }

  return {
    userId,
    signedIn: Boolean(userId),
    loading: list.loading,
    error: list.error,
    retry: list.reload,
    matches: list.data ?? [],
    actionError,
    /** Cria a partida a partir de uma cópia do usuário e já o coloca nela */
    create: (copyId: string) =>
      run(async () => {
        const match = await createMatch(copyId)
        await joinMatch(match.id, userId!)
      }, 'Não deu para criar a partida.'),
    leave: (participantId: string) => run(() => removeParticipant(participantId), 'Não deu para sair da partida.'),
    kick: (participantId: string) => run(() => removeParticipant(participantId), 'Não deu para tirar o jogador.'),
    cancel: (matchId: string) => run(() => deleteMatch(matchId), 'Não deu para cancelar a partida.'),
  }
}
