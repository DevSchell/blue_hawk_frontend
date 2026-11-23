import { Container } from '../../components/Container/Container'
import { PRIVACY_PATH, TERMS_PATH } from '../../layout/navigation'
import type { LegalDocument } from './legalContent'
import './LegalPage.css'

/** Página de texto legal (termos, privacidade): índice lateral e as seções */
export function LegalPage({ document, path }: { document: LegalDocument; path: string }) {
  return (
    <main className="legal-page">
      <Container>
        <header className="legal-page__header">
          <h1 className="legal-page__title">{document.title}</h1>
          <p className="legal-page__updated">Última atualização: {document.updatedAt}</p>
          <p className="legal-page__intro">{document.intro}</p>
        </header>

        <div className="legal-page__layout">
          <nav className="legal-page__toc" aria-label="Seções">
            <ol>
              {document.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
            <p className="legal-page__other">
              {path === TERMS_PATH ? (
                <a href={PRIVACY_PATH}>Ler a Política de privacidade</a>
              ) : (
                <a href={TERMS_PATH}>Ler os Termos de uso</a>
              )}
            </p>
          </nav>

          <article className="legal-page__content">
            {document.sections.map((section) => (
              <section key={section.id} id={section.id} className="legal-page__section">
                <h2>{section.title}</h2>
                {section.paragraphs?.map((text) => <p key={text}>{text}</p>)}
                {section.items && (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </Container>
    </main>
  )
}
