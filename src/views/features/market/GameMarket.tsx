import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { useState, type ReactNode } from 'react'
import {
  conditionLabel,
  deliveryLabel,
  type DeliveryMethod,
  type OfferCondition,
  type OfferDetailsInput,
} from '../../../models/offerDetails'
import { OfferForm } from '../store/OfferForm'
import { storeOfferHref } from '../../../models/store'
import { useGameMarket } from '../../../controllers/useGameMarket'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { UsersIcon } from '../../components/Icons/Icons'
import { matchPath, PLAY_PATH } from '../../layout/navigation'
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
    <LoadingCard compact message="Carregando ofertas…" />
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
            onSubmit={async (details) => {
              await market.publishOffer(details)
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
                  <a className="market__link" href={matchPath(match.id)}>
                    Ver partida
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
  id: string
  price: number
  description: string | null
  condition: OfferCondition | null
  deliveryMethod: DeliveryMethod | null
  createdAt: string
  isMine: boolean
}

/** Oferta do jogo: leva ao anúncio na Loja, onde estão os detalhes e o contato com quem vende */
function OfferCard({ id, price, description, condition, deliveryMethod, createdAt, isMine }: OfferCardProps) {
  const state = conditionLabel(condition)
  return (
    <li className="market-card">
      <div className="market-card__main">
        <b className="market-card__price">{brl.format(price)}</b>
        {state && <span className="badge market-card__condition">{state}</span>}
        {description && <p className="market-card__text">{description}</p>}
        <span className="market-card__meta">
          Entrega: {deliveryLabel(deliveryMethod, isMine ? 'seller' : 'buyer').toLowerCase()} · publicada em {shortDate.format(new Date(createdAt))}
        </span>
      </div>
      <div className="market-card__actions">
        {isMine && <span className="market-card__tag">Sua oferta</span>}
        <a className="button button--secondary market-card__open" href={storeOfferHref(id)}>
          Ver anúncio
        </a>
      </div>
    </li>
  )
}

type NewOfferFormProps = {
  onSubmit: (details: OfferDetailsInput) => Promise<void>
  onCancel: () => void
}

/** "Anunciar venda" na página do jogo: o mesmo formulário da estante */
function NewOfferForm({ onSubmit, onCancel }: NewOfferFormProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function submit(details: OfferDetailsInput) {
    setSending(true)
    setError('')
    try {
      await onSubmit(details)
    } catch {
      setError('Não deu para publicar a oferta. Tente de novo.')
      setSending(false)
    }
  }

  return (
    <div className="market-form">
      <OfferForm saving={sending} error={error} onSubmit={submit} onCancel={onCancel} />
    </div>
  )
}
