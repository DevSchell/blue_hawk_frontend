import { useId, useState, type FormEvent } from 'react'
import type { ShelfGame } from '../../../models/shelf'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { TextField } from '../../components/TextField/TextField'
import '../auth/AuthForm.css'
import './SaleModal.css'

const DESCRIPTION_MAX = 500

type SaleModalProps = {
  game: ShelfGame
  saving: boolean
  /** Erro devolvido pela API ao criar o anúncio */
  error: string
  onConfirm: (price: number, description: string) => void
  onClose: () => void
}

/** Anunciar um jogo da estante na loja: preço e uma observação opcional */
export function SaleModal({ game, saving, error, onConfirm, onClose }: SaleModalProps) {
  const [price, setPrice] = useState(String(game.salePrice))
  const [description, setDescription] = useState('')
  const [invalid, setInvalid] = useState('')
  const descriptionId = useId()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const value = Number(price.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) {
      setInvalid('Informe um preço maior que zero.')
      return
    }
    setInvalid('')
    onConfirm(Math.round(value), description)
  }

  const message = invalid || error

  return (
    <Modal
      open
      onClose={onClose}
      title="Anunciar venda"
      lead={`Defina o preço de “${game.boardgame.name}” na loja.`}
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {message && (
          <Alert tone="warn" size="sm" title="Não deu para anunciar">
            {message}
          </Alert>
        )}

        <TextField
          label="Preço (R$)"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={price}
          onChange={setPrice}
          hint="Valor inteiro, em reais."
          initialFocus
        />

        <div className="text-field">
          <label htmlFor={descriptionId}>Observação (opcional)</label>
          <div className="text-field__control">
            <textarea
              id={descriptionId}
              className="text-field__input sale-modal__textarea"
              rows={3}
              maxLength={DESCRIPTION_MAX}
              placeholder="Estado do jogo, se vem com expansões, retirada…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Anunciando…' : 'Anunciar na loja'}
        </Button>
      </form>
    </Modal>
  )
}
