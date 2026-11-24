import type { CSSProperties, ReactNode } from 'react'
import { Container } from '../Container/Container'
import './Hero.css'

type HeroProps = {
  title: string
  lead: string
  /** Conteúdo abaixo do texto (ex.: a busca) */
  children?: ReactNode
  /** Ilustração à direita; some em telas estreitas */
  art?: ReactNode
}

/** Faixa ultramar de abertura de página, com título na fonte da marca */
export function Hero({ title, lead, children, art }: HeroProps) {
  return (
    <div className="hero">
      <Container className="hero__grid">
        <div className="hero__content">
          {/* Cada palavra sobe em sequência; o leitor de tela lê o título inteiro de uma vez */}
          <h1 className="hero__title" aria-label={title}>
            {title.split(' ').map((word, i) => (
              <span key={i} className="hero__word" aria-hidden="true" style={{ '--i': i } as CSSProperties}>
                {word}
                {' '}
              </span>
            ))}
          </h1>
          <p className="hero__lead">{lead}</p>
          {children}
        </div>
        {art && <div className="hero__art">{art}</div>}
      </Container>
    </div>
  )
}
