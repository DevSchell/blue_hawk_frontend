import { useState, type ReactNode } from 'react'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { FormActions } from '../FormActions/FormActions'
import { Modal } from '../Modal/Modal'
import './ConfirmModal.css'

type ConfirmModalProps = {
  title: string
  lead?: string
  /** O que acontece ao confirmar */
  children: ReactNode
  confirmLabel: string
  /** Texto do botão enquanto a ação roda */
  busyLabel?: string
  cancelLabel?: string
  /** A ação; se der erro, a mensagem aparece na modal e ela continua aberta */
  onConfirm: () => Promise<void>
  onClose: () => void
}

/** Confirmação simples de uma ação (sem campos): Voltar e a confirmação, no rodapé padrão */
export function ConfirmModal({
  title,
  lead,
  children,
  confirmLabel,
  busyLabel,
  cancelLabel = 'Voltar',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await onConfirm()
    } catch {
      setError('Não deu para concluir. Tente de novo.')
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={() => !busy && onClose()} title={title} lead={lead}>
      <div className="confirm-modal">
        <p className="confirm-modal__text">{children}</p>
        {error && (
          <Alert tone="warn" size="sm" title="Algo deu errado">
            {error}
          </Alert>
        )}
        <FormActions onCancel={onClose} cancelLabel={cancelLabel} busy={busy}>
          <Button type="button" onClick={confirm} disabled={busy} data-autofocus>
            {busy ? (busyLabel ?? confirmLabel) : confirmLabel}
          </Button>
        </FormActions>
      </div>
    </Modal>
  )
}
