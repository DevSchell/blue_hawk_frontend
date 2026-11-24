import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { useId } from 'react'
import { useHostMatchController } from '../../../controllers/useHostMatchController'
import type { OpenMatch } from '../../../models/openMatch'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { TextField } from '../../components/TextField/TextField'
import { FormActions } from '../../components/FormActions/FormActions'
import '../auth/AuthForm.css'
import './PlayModals.css'

type HostMatchModalProps = {
  onHosted: (match: OpenMatch) => void
  onClose: () => void
}

/** Abrir uma partida com um jogo da estante: onde, quando e para quantos */
export function HostMatchModal({ onHosted, onClose }: HostMatchModalProps) {
  const c = useHostMatchController(onHosted)
  const gameId = useId()
  const playersId = useId()
  const notesId = useId()

  return (
    <Modal
      open
      onClose={onClose}
      title="Hospedar partida"
      lead="Escolha um jogo da sua estante e diga onde e quando. Você aprova quem pedir para entrar."
    >
      {c.loading ? (
        <LoadingCard compact message="Carregando seus jogos…" />
      ) : c.loadFailed ? (
        <Alert tone="warn" size="sm" title="Não deu para carregar">
          Não foi possível buscar os jogos da sua estante. Feche e tente de novo.
        </Alert>
      ) : c.games?.length === 0 ? (
        <Alert tone="info" size="sm" title="Nenhum jogo para hospedar">
          Para abrir uma partida, adicione à sua estante um jogo aprovado na Wiki que seja para 2 ou mais jogadores.
        </Alert>
      ) : (
        <form className="auth-form" onSubmit={c.submit} noValidate>
          {c.error && (
            <Alert tone="warn" size="sm" title="Não deu para abrir a partida">
              {c.error}
            </Alert>
          )}

          <div className="text-field">
            <label htmlFor={gameId}>Jogo</label>
            <div className="text-field__control">
              <select
                id={gameId}
                className="text-field__input play-modal__select"
                value={c.copyId}
                onChange={(e) => c.chooseGame(e.target.value)}
                data-autofocus
              >
                {c.games?.map((game) => (
                  <option key={game.copyId} value={game.copyId}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TextField
            label="Cidade"
            placeholder="Ex.: Blumenau"
            autoComplete="address-level2"
            maxLength={c.cityMax}
            value={c.city}
            onChange={c.setCity}
            hint="Combine o endereço exato com quem for aprovado."
          />

          <div className="play-modal__row">
            <TextField label="Quando" type="datetime-local" min={c.minWhen} value={c.when} onChange={c.setWhen} />
            <div className="text-field">
              <label htmlFor={playersId}>Jogadores</label>
              <div className="text-field__control">
                <select
                  id={playersId}
                  className="text-field__input play-modal__select"
                  value={c.maxPlayers}
                  onChange={(e) => c.setMaxPlayers(Number(e.target.value))}
                >
                  {Array.from({ length: c.playerLimit - 1 }, (_, i) => i + 2).map((n) => (
                    <option key={n} value={n}>
                      {n} (com você)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-field">
            <label htmlFor={notesId}>Observação (opcional)</label>
            <div className="text-field__control">
              <textarea
                id={notesId}
                className="text-field__input play-modal__textarea"
                rows={3}
                maxLength={c.notesMax}
                placeholder="Nível da mesa, se é para iniciantes, o que levar…"
                value={c.notes}
                onChange={(e) => c.setNotes(e.target.value)}
              />
            </div>
          </div>

          <FormActions onCancel={onClose} busy={c.isSaving}>
            <Button type="submit" disabled={c.isSaving}>
              {c.isSaving ? 'Abrindo…' : 'Abrir partida'}
            </Button>
          </FormActions>
        </form>
      )}
    </Modal>
  )
}
