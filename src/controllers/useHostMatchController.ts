import { useEffect, useState, type FormEvent } from 'react'
import { approvalStatusOf } from '../models/boardgame'
import { CITY_MAX, MATCH_TEXT_MAX, type OpenMatch } from '../models/openMatch'
import { readUserId } from '../models/session'
import { ApiError } from '../models/services/apiClient'
import { getBoardgameById } from '../models/services/boardgameService'
import { hostMatch } from '../models/services/openMatchService'
import { listUserBoardgames } from '../models/services/shelfService'

/** Jogo da estante que pode virar partida: aprovado e para 2+ jogadores */
export type HostableGame = { copyId: string; name: string; playerLimit: number }

/** Valor para <input type="datetime-local">, no fuso do navegador */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'Confira os dados: cidade, data no futuro (até 180 dias) e número de jogadores.'
    if (error.status === 401) return 'Sua sessão expirou. Entre de novo para continuar.'
    if (error.status === 403) return 'Esse jogo não está na sua estante.'
    if (error.status === 409) return 'Só jogos aprovados na Wiki podem virar partida.'
    return `O servidor respondeu com erro (${error.status}). Tente de novo.`
  }
  return 'Não foi possível conectar ao servidor.'
}

/** Formulário "Hospedar partida": jogo da estante, cidade, quando, quantos jogadores e observação */
export function useHostMatchController(onHosted: (match: OpenMatch) => void) {
  const userId = readUserId()
  const [games, setGames] = useState<HostableGame[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [copyId, setCopyId] = useState('')
  const [city, setCity] = useState('')
  const [when, setWhen] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(0)
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    listUserBoardgames(userId, controller.signal)
      .then(async (copies) => {
        // Uma cópia por jogo basta para hospedar
        const firstCopyByGame = new Map<string, string>()
        for (const copy of copies) {
          if (!firstCopyByGame.has(copy.boardgameId)) firstCopyByGame.set(copy.boardgameId, copy.id)
        }
        const loaded = await Promise.all(
          [...firstCopyByGame.entries()].map(async ([boardgameId, copy]) => {
            const game = await getBoardgameById(boardgameId, controller.signal).catch(() => null)
            return game && approvalStatusOf(game) === 'APPROVED' && (game.playerNumber ?? 0) >= 2
              ? { copyId: copy, name: game.name, playerLimit: game.playerNumber ?? 2 }
              : null
          }),
        )
        if (controller.signal.aborted) return
        const list = loaded.filter((g): g is HostableGame => g !== null).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        setGames(list)
        if (list[0]) {
          setCopyId(list[0].copyId)
          setMaxPlayers(list[0].playerLimit)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true)
      })
    return () => controller.abort()
  }, [userId])

  const selected = games?.find((g) => g.copyId === copyId) ?? null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    setError('')
    const cleanCity = city.trim()
    const date = when ? new Date(when) : null
    if (!selected) return setError('Escolha um jogo da sua estante.')
    if (cleanCity.length < 2) return setError('Informe a cidade da partida.')
    if (!date || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      return setError('Escolha uma data e hora no futuro.')
    }
    if (maxPlayers < 2 || maxPlayers > selected.playerLimit) {
      return setError(`O número de jogadores vai de 2 a ${selected.playerLimit}.`)
    }

    setIsSaving(true)
    try {
      onHosted(
        await hostMatch({
          userBoardgameId: selected.copyId,
          city: cleanCity,
          scheduledAt: date.toISOString(),
          maxPlayers,
          notes: notes.trim() || null,
        }),
      )
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    games,
    loading: games === null && !loadFailed,
    loadFailed,
    copyId,
    chooseGame: (id: string) => {
      setCopyId(id)
      const game = games?.find((g) => g.copyId === id)
      if (game) setMaxPlayers(game.playerLimit)
    },
    playerLimit: selected?.playerLimit ?? 2,
    city,
    setCity,
    when,
    setWhen,
    /** Mínimo do campo de data: agora */
    minWhen: toLocalInput(new Date()),
    maxPlayers,
    setMaxPlayers,
    notes,
    setNotes,
    isSaving,
    error,
    submit,
    cityMax: CITY_MAX,
    notesMax: MATCH_TEXT_MAX,
  }
}
