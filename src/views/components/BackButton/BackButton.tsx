import { goBack } from '../../layout/router'
import './BackButton.css'

type BackButtonProps = {
  /** Para onde ir quando não há tela anterior no app (link aberto direto) */
  fallback: string
  /** Texto do botão (padrão: "Voltar") */
  label?: string
}

/** Voltar discreto, no topo das páginas de produto, de jogo e de categoria */
export function BackButton({ fallback, label = 'Voltar' }: BackButtonProps) {
  return (
    <button type="button" className="back-button" onClick={() => goBack(fallback)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {label}
    </button>
  )
}
