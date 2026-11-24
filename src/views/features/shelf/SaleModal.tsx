import type { OfferDetailsInput } from '../../../models/offerDetails'
import type { ShelfGame } from '../../../models/shelf'
import { Modal } from '../../components/Modal/Modal'
import { OfferForm } from '../store/OfferForm'

type SaleModalProps = {
  game: ShelfGame
  saving: boolean
  /** Erro devolvido pela API ao criar o anúncio */
  error: string
  onConfirm: (details: OfferDetailsInput) => void
  onClose: () => void
}

/** Anunciar um jogo da estante na Loja: preço, estado de conservação, entrega e descrição */
export function SaleModal({ game, saving, error, onConfirm, onClose }: SaleModalProps) {
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Anunciar venda"
      lead={`Conte como está o seu “${game.boardgame.name}” e como ele chega até quem comprar.`}
    >
      <OfferForm
        initialPrice={game.salePrice || undefined}
        saving={saving}
        error={error}
        onSubmit={onConfirm}
        onCancel={onClose}
      />
    </Modal>
  )
}
