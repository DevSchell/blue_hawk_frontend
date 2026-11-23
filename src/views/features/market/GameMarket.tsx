import { useState, type FormEvent, type ReactNode } from 'react'
import { useGameMarket } from '../../../controllers/useGameMarket'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { UsersIcon } from '../../components/Icons/Icons'
import { TextField } from '../../components/TextField/TextField'
import { PLAY_PATH } from '../../layout/navigation'
import { formatMatchDate } from '../play/format'
import './GameMarket.css'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })

type GameMarketProps = {
  /** Estado do mercado do jogo, compartilhado com a barra de ações da modal */
  market: ReturnType<typeof useGameMarket>
  /** Formulário "Anunciar venda" aberto (pela barra de ações da modal) */
  isCreating: boolean
  onCloseCreate: () => void
}

/** Ofertas à venda e partidas abertas do jogo, dentro da modal de detalhes */
export function GameMarket({ market, isCreating, onCloseCreate }: GameMarketProps) {
  // Mesmo aviso nas duas seções enquanto não há sessão, carregamento ou erro
  const status = !market.signedIn ? (
    <Alert title="Entre para ver" size="sm">
      Ofertas e partidas aparecem para quem está logado.
    </Alert>
  ) : market.loading ? (
    <div className="market__loading" aria-busy="true">
      Carregando…
    </div>
  ) : market.error ? (
    <Alert
      title="Não deu para carregar"
      tone="warn"
      size="sm"
      action={
        <Button variant="link" onClick={market.retry}>
          Tentar de novo
        </Button>
      }
    >
      Verifique a conexão e tente outra vez.
    </Alert>
  ) : null

  return (
    <>
      <MarketSection title="Ofertas disponíveis">
        {isCreating && market.ownsGame && (
          <NewOfferForm
            onSubmit={async (price, description) => {
              await market.publishOffer(price, description)
              onCloseCreate()
            }}
            onCancel={onCloseCreate}
          />
        )}
        {status ??
          (market.offers.length === 0 ? (
            <p className="market__empty">Ninguém está vendendo este jogo agora.</p>
          ) : (
            <ul className="market__list">
              {market.offers.map((offer) => (
                <OfferCard key={offer.id} {...offer} />
              ))}
            </ul>
          ))}
      </MarketSection>

      {/* Partidas do Jogue (matchmaking): pedir vaga acontece lá, com mensagem para o host */}
      <MarketSection title="Próximas partidas">
        {status ??
          (market.matches.length === 0 ? (
            <p className="market__empty">
              Ninguém abriu partida deste jogo ainda.{' '}
              <a className="market__link" href={PLAY_PATH}>
                Abrir uma no Jogue
              </a>
            </p>
          ) : (
            <ul className="market__list">
              {market.matches.map((match) => (
                <li key={match.id} className="market-card">
                  <div className="market-card__main">
                    <b className="market-card__headline">
                      <UsersIcon />
                      {match.city} • {formatMatchDate(match.scheduledAt)}
                    </b>
                    <span className="market-card__meta">
                      {match.isHost
                        ? 'Partida sua'
                        : `Com ${match.host.name} • ${
                            match.seatsLeft > 0
                              ? `${match.seatsLeft} ${match.seatsLeft === 1 ? 'vaga' : 'vagas'}`
                              : 'lotada'
                          }`}
                    </span>
                  </div>
                  <a className="market__link" href={`${PLAY_PATH}?cidade=${encodeURIComponent(match.city)}`}>
                    Ver no Jogue
                  </a>
                </li>
              ))}
            </ul>
          ))}
      </MarketSection>
    </>
  )
}

function MarketSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const id = `market-${title.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section className="market" aria-labelledby={id}>
      <div className="market__head">
        <h3 id={id}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

type OfferCardProps = {
  price: number
  description: string | null
  createdAt: string
  isMine: boolean
}

function OfferCard({ price, description, createdAt, isMine }: OfferCardProps) {
  // A API ainda não recebe propostas sobre uma oferta: o botão só avisa
  const [asked, setAsked] = useState(false)

  return (
    <li className="market-card">
      <div className="market-card__main">
        <b className="market-card__price">{brl.format(price)}</b>
        {description && <p className="market-card__text">{description}</p>}
        <span className="market-card__meta">Publicada em {shortDate.format(new Date(createdAt))}</span>
        {asked && (
          <span className="market-card__note" role="status">
            Em breve: propostas ainda não estão disponíveis.
          </span>
        )}
      </div>
      {isMine ? (
        <span className="market-card__tag">Sua oferta</span>
      ) : (
        <Button variant="secondary" onClick={() => setAsked(true)}>
          Fazer oferta
        </Button>
      )}
    </li>
  )
}

type NewOfferFormProps = {
  onSubmit: (price: number, description: string) => Promise<void>
  onCancel: () => void
}

function NewOfferForm({ onSubmit, onCancel }: NewOfferFormProps) {
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const value = Number(price.replace(/\./g, '').replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) {
      setError('Informe um preço maior que zero.')
      return
    }
    setSending(true)
    setError(null)
    try {
      await onSubmit(value, description.trim())
    } catch {
      setError('Não deu para publicar a oferta. Tente de novo.')
      setSending(false)
    }
  }

  return (
    <form className="market-form" onSubmit={submit} noValidate>
      <TextField
        label="Preço (R$)"
        value={price}
        onChange={setPrice}
        inputMode="decimal"
        placeholder="Ex.: 150,00"
        required
        autoFocus
      />
      <TextField
        label="Descrição"
        value={description}
        onChange={setDescription}
        placeholder="Estado da caixa, o que acompanha…"
        maxLength={280}
      />
      {error && (
        <Alert title="Ops" tone="warn" size="sm">
          {error}
        </Alert>
      )}
      <div className="market-form__actions">
        <Button type="submit" disabled={sending}>
          {sending ? 'Publicando…' : 'Publicar oferta'}
        </Button>
        <Button variant="link" onClick={onCancel} disabled={sending}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
