import type { ReactNode } from 'react'
import { BackButton } from '../../components/BackButton/BackButton'
import { Container } from '../../components/Container/Container'
import { CategoryArt } from './CategoryArt'
import './CategoryHeader.css'

type CategoryHeaderProps = {
  /** Nome da categoria (escolhe a arte) */
  name: string
  /** Seção acima na trilha (ex.: "Wiki" ou "Loja") */
  section: { label: string; href: string }
  title: string
  lead?: ReactNode
  /** Para onde o "voltar" leva quando a página foi aberta direto */
  backFallback: string
}

/** Cabeçalho das páginas de categoria: a arte da categoria de fundo, trilha, título e o "voltar" */
export function CategoryHeader({ name, section, title, lead, backFallback }: CategoryHeaderProps) {
  return (
    <header className="category-header">
      <div className="category-header__art" aria-hidden="true">
        <CategoryArt name={name} />
      </div>
      <Container className="category-header__content">
        <BackButton fallback={backFallback} />
        <ol className="category-header__crumbs" aria-label="Você está em">
          <li>
            <a href={section.href}>{section.label}</a>
          </li>
          <li aria-current="page">{name}</li>
        </ol>
        <h1 className="category-header__title">{title}</h1>
        {lead && <p className="category-header__lead">{lead}</p>}
      </Container>
    </header>
  )
}
