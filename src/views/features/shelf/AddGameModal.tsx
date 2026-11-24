import { useId } from 'react'
import { useAddGameController } from '../../../controllers/useAddGameController'
import type { Boardgame } from '../../../models/boardgame'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { TextField } from '../../components/TextField/TextField'
import { formatPlayers } from '../boardgames/format'
import { GameCover } from '../boardgames/GameCover'
import './AddGameModal.css'
import { coverOf } from '../../../models/services/boardgameService'

type AddGameModalProps = {
  /** Ids dos boardgames que já estão na estante */
  ownedIds: Set<string>
  onAdded: (game: Boardgame) => void
  /** "Não achou seu jogo?": troca esta modal pelo cadastro de um jogo novo */
  onCreateNew: () => void
  onClose: () => void
}

function facts(game: Boardgame) {
  return [
    game.playerNumber ? formatPlayers(game.playerNumber) : null,
    game.playTime ? `${game.playTime} min` : null,
    game.releaseYear ? String(game.releaseYear) : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Escolher um jogo da Wiki para colocar na estante */
export function AddGameModal({ ownedIds, onAdded, onCreateNew, onClose }: AddGameModalProps) {
  const c = useAddGameController(ownedIds, onAdded)
  const statusId = useId()

  return (
    <Modal
      open
      onClose={onClose}
      title="Adicionar jogo"
      lead="Escolha um jogo da Wiki para colocar na sua estante."
      size="lg"
    >
      <div className="add-game">
        <TextField
          label="Buscar na Wiki"
          type="search"
          autoComplete="off"
          placeholder="Ex.: Catan"
          value={c.search}
          onChange={c.setSearch}
          initialFocus
          aria-describedby={statusId}
        />

        <p id={statusId} className="add-game__status" aria-live="polite">
          {c.loading
            ? 'Buscando…'
            : c.error
              ? ''
              : c.query
                ? `${c.results.length} ${c.results.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}`
                : 'Jogos da Wiki em ordem alfabética'}
        </p>

        {c.error && (
          <Alert tone="warn" size="sm" title="Não deu para buscar">
            Não foi possível falar com o servidor. Tente de novo.
          </Alert>
        )}

        {c.isEmpty && (
          <p className="add-game__empty">
            Nenhum jogo da Wiki com “{c.query}”. Se ele ainda não está no catálogo, cadastre logo abaixo.
          </p>
        )}

        {c.results.length > 0 && (
          <ul className="add-game__list">
            {c.results.map((game) => {
              const owned = c.isOwned(game)
              const adding = c.addingId === game.id
              return (
                <li key={game.id} className="add-game__item">
                  <div className="add-game__cover">
                    <GameCover id={game.id} name={game.name} {...coverOf(game)} />
                  </div>
                  <div className="add-game__info">
                    <b className="add-game__name">{game.name}</b>
                    <small className="add-game__facts">{facts(game)}</small>
                    {c.failedId === game.id && (
                      <small className="add-game__error" role="alert">
                        Não deu para adicionar. Tente de novo.
                      </small>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={owned ? 'secondary' : 'primary'}
                    className="add-game__action"
                    disabled={owned || Boolean(c.addingId)}
                    onClick={() => c.add(game)}
                    aria-label={owned ? `${game.name} já está na estante` : `Adicionar ${game.name} à estante`}
                  >
                    {owned ? 'Na estante' : adding ? 'Adicionando…' : 'Adicionar'}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="add-game__footer">
          <span>Não achou seu jogo?</span>
          <Button type="button" variant="link" onClick={onCreateNew}>
            Cadastre ele aqui!
          </Button>
        </div>
      </div>
    </Modal>
  )
}
