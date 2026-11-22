import { useState, type FormEvent } from 'react'
import type { Boardgame } from '../../../models/boardgame'
import { ApiError } from '../../../models/services/apiClient'
import { createBoardgame, updateBoardgame, type BoardgameInput } from '../../../models/services/boardgameService'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/TextField/TextField'
import '../auth/AuthForm.css'

/** Limites da API (colunas do banco) */
const NAME_MAX = 150
const DESCRIPTION_MAX = 150

function toInt(value: string) {
  return /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN
}

type BoardgameFormProps = {
  /** Sem jogo: cadastra um novo; com jogo: edita */
  game?: Boardgame
  onSaved: (game: Boardgame) => void
  onCancel: () => void
}

/** Formulário de jogo do catálogo (POST/PUT /boardgames). A API exige todos os campos. */
export function BoardgameForm({ game, onSaved, onCancel }: BoardgameFormProps) {
  const [name, setName] = useState(game?.name ?? '')
  const [description, setDescription] = useState(game?.description ?? '')
  const [year, setYear] = useState(game?.releaseYear ? String(game.releaseYear) : '')
  const [players, setPlayers] = useState(game?.playerNumber ? String(game.playerNumber) : '')
  const [time, setTime] = useState(game?.playTime ? String(game.playTime) : '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const input: BoardgameInput = {
      name: name.trim(),
      description: description.trim(),
      releaseYear: toInt(year),
      playerNumber: toInt(players),
      playTime: toInt(time),
    }
    const thisYear = new Date().getFullYear()
    const invalid =
      !input.name ? 'Informe o nome do jogo.'
      : !input.description ? 'Escreva uma descrição curta.'
      : !(input.releaseYear >= 1 && input.releaseYear <= thisYear + 1) ? `Informe o ano de lançamento (até ${thisYear + 1}).`
      : !(input.playerNumber >= 1) ? 'Informe o número de jogadores.'
      : !(input.playTime >= 1) ? 'Informe a duração em minutos.'
      : null
    if (invalid) {
      setError(invalid)
      return
    }
    setSending(true)
    setError(null)
    try {
      const saved = game ? await updateBoardgame(game.id, input) : await createBoardgame(input)
      onSaved(saved)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 500
          ? 'Não deu para salvar. Já existe um jogo com esse nome?'
          : 'Não deu para salvar o jogo. Tente de novo.',
      )
      setSending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      {error && (
        <Alert tone="warn" size="sm" title="Ops">
          {error}
        </Alert>
      )}
      <TextField label="Nome" value={name} onChange={setName} maxLength={NAME_MAX} initialFocus />
      <TextField label="Descrição" value={description} onChange={setDescription} maxLength={DESCRIPTION_MAX} hint={`${description.length}/${DESCRIPTION_MAX}`} />
      <div className="field-row">
        <TextField label="Lançamento" value={year} onChange={setYear} inputMode="numeric" placeholder="2020" />
        <TextField label="Jogadores" value={players} onChange={setPlayers} inputMode="numeric" placeholder="4" />
        <TextField label="Minutos" value={time} onChange={setTime} inputMode="numeric" placeholder="60" />
      </div>
      <Button type="submit" fullWidth disabled={sending}>
        {sending ? 'Salvando…' : game ? 'Salvar alterações' : 'Cadastrar jogo'}
      </Button>
      <Button variant="link" onClick={onCancel} disabled={sending}>
        Cancelar
      </Button>
    </form>
  )
}
