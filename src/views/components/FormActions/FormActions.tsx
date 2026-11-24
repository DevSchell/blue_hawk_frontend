import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import './FormActions.css'

type FormActionsProps = {
  /** Sem ele, só a confirmação aparece */
  onCancel?: () => void
  cancelLabel?: string
  /** Trava o Cancelar enquanto a confirmação está em andamento */
  busy?: boolean
  /** O botão de confirmar (normalmente o submit do formulário) */
  children: ReactNode
}

/**
 * Rodapé padrão de modais e confirmações: Cancelar (botão que fica vermelho no hover) e, à direita, a confirmação.
 */
export function FormActions({ onCancel, cancelLabel = 'Cancelar', busy = false, children }: FormActionsProps) {
  return (
    <div className="form-actions">
      {onCancel && (
        <Button type="button" variant="danger" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
      )}
      {children}
    </div>
  )
}
