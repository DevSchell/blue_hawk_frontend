import { Wordmark } from '../components/Brand/Wordmark'
import { Container } from '../components/Container/Container'
import { PRIVACY_PATH, TERMS_PATH } from './navigation'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <Container className="footer__inner">
        <Wordmark size="lg" />
        <div className="footer__side">
          <p>Toda mesa começa com um bom jogo.</p>
          <nav aria-label="Informações legais" className="footer__legal">
            <a href={TERMS_PATH}>Termos de uso</a>
            <a href={PRIVACY_PATH}>Política de privacidade</a>
          </nav>
        </div>
      </Container>
    </footer>
  )
}
