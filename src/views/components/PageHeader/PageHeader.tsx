import type { ReactNode } from 'react'
import './PageHeader.css'

type PageHeaderProps = {
  title: string
  /** Frase curta abaixo do título */
  lead?: ReactNode
  /** h1 no topo da página; h2 quando a página já abre com o Hero */
  level?: 1 | 2
  id?: string
  /** Conteúdo extra do cabeçalho (ex.: data de atualização) */
  children?: ReactNode
}

/** Cabeçalho padrão das páginas: título em display e o lead em texto suave */
export function PageHeader({ title, lead, level = 1, id, children }: PageHeaderProps) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return (
    <header className="page-header">
      <Heading id={id} className="page-header__title">
        {title}
      </Heading>
      {lead && <p className="page-header__lead">{lead}</p>}
      {children}
    </header>
  )
}
