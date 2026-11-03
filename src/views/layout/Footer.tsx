import { Wordmark } from '../components/Brand/Wordmark'
import { Container } from '../components/Container/Container'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <Container className="footer__inner">
        <Wordmark size="lg" />
        <p>Toda mesa começa com um bom jogo.</p>
      </Container>
    </footer>
  )
}
