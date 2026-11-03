import { useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { Raven } from '../Brand/Raven'
import { Wordmark } from '../Brand/Wordmark'
import { IconButton } from '../IconButton/IconButton'
import { CloseIcon } from '../Icons/Icons'
import { cx } from '../../utils/classNames'
import './Modal.css'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  /** Frase curta abaixo do título */
  lead?: string
  /** Imagem de ponta a ponta entre o topo e o conteúdo (ex.: a capa de um jogo) */
  media?: ReactNode
  /** md: formulários (440px); lg: conteúdo (600px) */
  size?: 'md' | 'lg'
  children: ReactNode
}

/**
 * Janela modal centralizada, com o topo Noite da topbar. Usa <dialog> modal, que prende o foco,
 * fecha com Esc e devolve o foco a quem abriu; clique fora do painel também fecha. Em telas baixas,
 * o conteúdo rola dentro da janela. Ao abrir, foca o campo marcado com data-autofocus.
 */
export function Modal({ open, onClose, title, lead, media, size = 'md', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Fechamento feito pelo próprio componente (desmontagem): não deve avisar quem usa a modal
  const closingSilently = useRef(false)
  const titleId = useId()

  // useLayoutEffect: a limpeza roda antes de o React tirar o <dialog> da página;
  // com useEffect ele já estaria fora, e um <dialog> fora da página não devolve o foco
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
    // Ao ser desmontada ainda aberta, fecha antes: só assim o navegador devolve o foco a quem abriu.
    // No StrictMode (dev) isso também roda na desmontagem de teste, e o efeito reabre em seguida.
    return () => {
      if (dialog.open) {
        closingSilently.current = true
        dialog.close()
      }
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onClose={() => {
        // O evento "close" chega depois; se fomos nós que fechamos, ignora
        if (closingSilently.current) {
          closingSilently.current = false
          return
        }
        onClose()
      }}
      // Clique fora do painel cai no próprio <dialog> (área do backdrop)
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={cx('modal__panel', `modal__panel--${size}`)}>
        <div className="modal__header">
          <Raven variant="noite" />
          <Wordmark size="sm" />
          <IconButton label="Fechar" variant="ghost" className="modal__close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        {media && <div className="modal__media">{media}</div>}
        <div className="modal__body">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          {lead && <p className="modal__lead">{lead}</p>}
          {children}
        </div>
      </div>
    </dialog>
  )
}
