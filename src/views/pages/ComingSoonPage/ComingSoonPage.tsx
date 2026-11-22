import { Raven } from '../../components/Brand/Raven'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import '../FeedPage/FeedPage.css'

/** Página de seção que ainda não existe (Loja, Estante) */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <main className="feed-page">
      <Container>
        <h1 className="feed-page__title">{title}</h1>
        <EmptyState icon={<Raven variant="noite" />} title="Em breve">
          Esta seção ainda está sendo preparada. Enquanto isso, explore os jogos na Wiki.
        </EmptyState>
      </Container>
    </main>
  )
}
