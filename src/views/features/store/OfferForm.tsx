import { useId, useState, type FormEvent } from 'react'
import {
  DELIVERY_METHODS,
  OFFER_CONDITIONS,
  OFFER_DESCRIPTION_MAX,
  OFFER_DESCRIPTION_MIN,
  validateOfferDetails,
  type DeliveryMethod,
  type OfferCondition,
  type OfferDetailsInput,
} from '../../../models/offerDetails'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/TextField/TextField'
import { cx } from '../../utils/classNames'
import { FormActions } from '../../components/FormActions/FormActions'
import './OfferForm.css'

type OfferFormProps = {
  /** Preço sugerido (ex.: o que a pessoa já tinha colocado na estante) */
  initialPrice?: number
  saving: boolean
  /** Erro devolvido pela API */
  error?: string
  submitLabel?: string
  onSubmit: (details: OfferDetailsInput) => void
  onCancel?: () => void
}

/**
 * Anunciar um jogo na Loja: preço, estado de conservação, formas de entrega e a descrição do exemplar.
 * Usado na estante ("Anunciar venda") e na página do jogo.
 */
export function OfferForm({
  initialPrice,
  saving,
  error,
  submitLabel = 'Anunciar na Loja',
  onSubmit,
  onCancel,
}: OfferFormProps) {
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : '')
  const [condition, setCondition] = useState<OfferCondition | null>(null)
  const [delivery, setDelivery] = useState<DeliveryMethod | null>('A_COMBINAR')
  const [description, setDescription] = useState('')
  const [invalid, setInvalid] = useState('')
  const descriptionId = useId()
  const conditionLabelId = useId()
  const deliveryLabelId = useId()

  function submit(e: FormEvent) {
    e.preventDefault()
    const result = validateOfferDetails({ price, condition, deliveryMethod: delivery, description })
    if (!result.value) {
      setInvalid(result.error ?? '')
      return
    }
    setInvalid('')
    onSubmit(result.value)
  }

  const message = invalid || error
  const length = description.trim().length

  return (
    <form className="offer-form" onSubmit={submit} noValidate>
      {message && (
        <Alert tone="warn" size="sm" title="Não deu para anunciar">
          {message}
        </Alert>
      )}

      <TextField
        label="Preço (R$)"
        inputMode="decimal"
        placeholder="Ex.: 150"
        value={price}
        onChange={setPrice}
        initialFocus
      />

      <fieldset className="offer-form__group" aria-labelledby={conditionLabelId}>
        <legend id={conditionLabelId}>Estado de conservação</legend>
        <div className="offer-form__options offer-form__options--condition">
          {OFFER_CONDITIONS.map((option) => (
            <label key={option.value} className={cx('offer-option', condition === option.value && 'is-on')}>
              <input
                type="radio"
                name={conditionLabelId}
                value={option.value}
                checked={condition === option.value}
                onChange={() => setCondition(option.value)}
              />
              <span className="offer-option__title">{option.label}</span>
              <span className="offer-option__hint">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="offer-form__group" aria-labelledby={deliveryLabelId}>
        <legend id={deliveryLabelId}>Forma de entrega</legend>
        <div className="offer-form__options">
          {DELIVERY_METHODS.map((option) => (
            <label key={option.value} className={cx('offer-option', delivery === option.value && 'is-on')}>
              <input
                type="radio"
                name={deliveryLabelId}
                value={option.value}
                checked={delivery === option.value}
                onChange={() => setDelivery(option.value)}
              />
              <span className="offer-option__title">{option.label}</span>
              <span className="offer-option__hint">{option.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="text-field">
        <label htmlFor={descriptionId}>Descrição do exemplar</label>
        <textarea
          id={descriptionId}
          className="text-field__input offer-form__description"
          rows={4}
          maxLength={OFFER_DESCRIPTION_MAX}
          placeholder="O que vem na caixa, expansões, se falta alguma peça, a história desse exemplar…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-describedby={`${descriptionId}-count`}
        />
        <span
          id={`${descriptionId}-count`}
          className={cx(
            'text-field__hint',
            'offer-form__count',
            length > 0 && length < OFFER_DESCRIPTION_MIN && 'is-short',
          )}
        >
          {length < OFFER_DESCRIPTION_MIN
            ? `Mínimo de ${OFFER_DESCRIPTION_MIN} caracteres`
            : `${length}/${OFFER_DESCRIPTION_MAX}`}
        </span>
      </div>

      <FormActions onCancel={onCancel} busy={saving}>
        <Button type="submit" disabled={saving}>
          {saving ? 'Anunciando…' : submitLabel}
        </Button>
      </FormActions>
    </form>
  )
}
