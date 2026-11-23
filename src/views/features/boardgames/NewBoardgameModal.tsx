import type { Boardgame } from '../../../models/boardgame'
import { Modal } from '../../components/Modal/Modal'
import { BoardgameForm } from './BoardgameForm'

/** Cadastro de um jogo novo no catálogo */
export function NewBoardgameModal({ onSaved, onClose }: { onSaved: (game: Boardgame) => void; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Cadastrar jogo" lead="Não achou o seu jogo? Ele fica disponível para todos.">
      <BoardgameForm onSaved={onSaved} onCancel={onClose} />
    </Modal>
  )
}
