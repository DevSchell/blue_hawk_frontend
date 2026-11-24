import { Raven } from '../../components/Brand/Raven'
import { Container } from '../../components/Container/Container'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import { EmptyState } from '../../components/EmptyState/EmptyState'

/** Página de seção que ainda não existe (Loja, Estante) */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <main className="page">
      <Container>
        <PageHeader title={title} />
        <EmptyState icon={<Raven variant="noite" />} title="Em breve">
          Esta seção ainda está sendo preparada. Enquanto isso, explore os jogos na Wiki.
        </EmptyState>
      </Container>
    </main>
  )
}
