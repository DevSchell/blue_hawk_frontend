import { Raven } from './Raven'
import { Wordmark } from './Wordmark'
import './Brand.css'

/** Corvo + nome, linkando para o início. variant segue o fundo onde o logo aparece. */
export function Logo({ variant = 'noite', href = '/' }: { variant?: 'noite' | 'ultra'; href?: string }) {
  return (
    <a className="logo" href={href} aria-label="Blue Hawk, início">
      <Raven variant={variant} />
      <Wordmark size="md" />
    </a>
  )
}
