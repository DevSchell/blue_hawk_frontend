import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { lockBodyScroll } from '../../utils/scrollLock'
import './Drawer.css'

type DrawerProps = {
  open: boolean
  onClose: () => void
  /** Nome acessível do painel */
  label: string
  children: ReactNode
}

/**
 * Painel lateral sobre a página, aberto pela direita. Usa <dialog> modal, que já prende o foco,
 * fecha com Esc e devolve o foco a quem abriu. Clique fora do painel também fecha.
 */
export function Drawer({ open, onClose, label, children }: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // useLayoutEffect, como no Modal: se a gaveta fechar e uma modal abrir no mesmo clique,
  // a gaveta fecha primeiro e a modal guarda o botão do menu como quem a abriu
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const unlockScroll = open ? lockBodyScroll() : undefined
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    return unlockScroll
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="drawer"
      aria-label={label}
      onClose={onClose}
      // Clique fora do painel cai no próprio <dialog> (área do backdrop)
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="drawer__panel">{children}</div>
    </dialog>
  )
}
