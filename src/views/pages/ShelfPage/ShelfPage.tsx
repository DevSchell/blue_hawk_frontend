import { useState, type FormEvent } from 'react'
import { useShelfController } from '../../../controllers/useShelfController'
import { useDebouncedValue } from '../../../controllers/useDebouncedValue'
import type { Boardgame } from '../../../models/boardgame'
import type { Offer } from '../../../models/market'
import { listBoardgames } from '../../../models/services/boardgameService'
import type { ShelfItem } from '../../../models/services/shelfService'
import { Alert } from '../../components/Alert/Alert'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { Modal } from '../../components/Modal/Modal'
import { SearchField } from '../../components/SearchField/SearchField'
import { TextField } from '../../components/TextField/TextField'
import { BoardgameModal } from '../../features/boardgames/BoardgameModal'
import { GameCover } from '../../features/boardgames/GameCover'
import { brl } from '../../features/boardgames/format'
import '../FeedPage/FeedPage.css'
import './ShelfPage.css'

type Shelf = ReturnType<typeof useShelfController>

/** Estante: a coleção pessoal do usuário, com venda de cada jogo */
export function ShelfPage({ onSignIn }: { onSignIn: () => void }) {
  const shelf = useShelfController()
  const [adding, setAdding] = useState(false)
  const [detail, setDetail] = useState<Boardgame | null>(null)
  const [selling, setSelling] = useState<{ item: ShelfItem; offer: Offer | null } | null>(null)

  if (!shelf.signedIn) {
    return (
      <main className="feed-page">
        <Container>
          <h1 className="feed-page__title">Estante</h1>
          <EmptyState icon={<Raven variant="noite" />} title="Entre para ver a sua estante">
            Sua coleção de jogos fica salva na sua conta.
            <div className="shelf-empty__action">
              <Button onClick={onSignIn}>Entrar</Button>
            </div>
          </EmptyState>
        </Container>
      </main>
    )
  }

  return (
    <main className="feed-page">
      <Container>
        <h1 className="feed-page__title">Estante</h1>
        <div className="shelf-toolbar">
          <SearchField id="busca-estante" label="Buscar na minha estante" placeholder="Ex.: Catan" value={shelf.search} onChange={shelf.setSearch} />
          <Button onClick={() => setAdding(true)}>Adicionar jogo</Button>
        </div>
        {shelf.actionError && <Alert title="Ops" tone="warn" size="sm">{shelf.actionError}</Alert>}
        {shelf.error ? (
          <Alert title="Não deu para carregar" tone="warn" action={<Button variant="link" onClick={shelf.retry}>Tentar de novo</Button>}>
            Verifique a conexão e tente outra vez.
          </Alert>
        ) : shelf.loading && shelf.items.length === 0 ? (
          <p className="shelf-status" aria-busy="true">Carregando estante…</p>
        ) : shelf.items.length === 0 ? (
          <EmptyState icon={<Raven variant="noite" />} title={shelf.query ? 'Nenhum jogo com esse nome' : 'Sua estante está vazia'}>
            {shelf.query ? 'Tente outra palavra ou limpe a busca.' : 'Adicione os jogos que você tem para organizar a coleção e vender.'}
          </EmptyState>
        ) : (
          <ul className="shelf-grid">
            {shelf.items.map((item) => (
              <ShelfCard key={item.copy.id} item={item} shelf={shelf} onOpen={() => setDetail(item.game)} onSell={(offer) => setSelling({ item, offer })} />
            ))}
          </ul>
        )}
      </Container>
      {adding && <AddGameModal owned={shelf.ownedGameIds} onAdd={shelf.addGame} onClose={() => setAdding(false)} />}
      {selling && (
        <SellModal
          title={selling.item.game.name}
          offer={selling.offer}
          onClose={() => setSelling(null)}
          onSubmit={async (price, description) => {
            if (selling.offer) await shelf.editOffer(selling.offer.id, price, description)
            else await shelf.sell(selling.item.copy.id, price, description)
            setSelling(null)
          }}
        />
      )}
      {detail && <BoardgameModal key={detail.id} game={detail} onClose={() => setDetail(null)} />}
    </main>
  )
}

function ShelfCard({ item, shelf, onOpen, onSell }: { item: ShelfItem; shelf: Shelf; onOpen: () => void; onSell: (offer: Offer | null) => void }) {
  const { game, offer, copy } = item
  const [busy, setBusy] = useState(false)

  async function guard(action: () => Promise<unknown>) {
    setBusy(true)
    try {
      await action()
    } catch {
      /* o aviso aparece no topo da lista */
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="shelf-card">
      <GameCover id={game.id} name={game.name} />
      <div className="shelf-card__body">
        <h3 className="shelf-card__title">
          <button type="button" className="shelf-card__link" onClick={onOpen}>{game.name}</button>
        </h3>
        {offer ? <b className="shelf-card__price">À venda por {brl.format(offer.price)}</b> : <span className="shelf-card__meta">Não está à venda</span>}
        <div className="shelf-card__actions">
          <Button variant="secondary" disabled={busy} onClick={() => onSell(offer)}>{offer ? 'Editar oferta' : 'Vender'}</Button>
          {offer && <Button variant="link" disabled={busy} onClick={() => guard(() => shelf.withdrawOffer(offer.id))}>Tirar da venda</Button>}
          <Button
            variant="link"
            disabled={busy}
            onClick={() => {
              if (window.confirm(`Remover “${game.name}” da sua estante? Ofertas e partidas desse jogo também serão apagadas.`)) void guard(() => shelf.removeGame(copy.id))
            }}
          >
            Remover
          </Button>
        </div>
      </div>
    </li>
  )
}

function SellModal({ title, offer, onSubmit, onClose }: { title: string; offer: Offer | null; onSubmit: (price: number, description: string) => Promise<void>; onClose: () => void }) {
  const [price, setPrice] = useState(offer ? String(offer.price).replace('.', ',') : '')
  const [description, setDescription] = useState(offer?.description ?? '')
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
      setError('Não deu para salvar a oferta. Tente de novo.')
      setSending(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={offer ? 'Editar oferta' : 'Colocar à venda'} lead={title}>
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && <Alert tone="warn" size="sm" title="Ops">{error}</Alert>}
        <TextField label="Preço (R$)" value={price} onChange={setPrice} inputMode="decimal" placeholder="Ex.: 150,00" initialFocus />
        <TextField label="Descrição" value={description} onChange={setDescription} placeholder="Estado da caixa, o que acompanha…" maxLength={280} />
        <Button type="submit" fullWidth disabled={sending}>{sending ? 'Salvando…' : offer ? 'Salvar' : 'Publicar oferta'}</Button>
      </form>
    </Modal>
  )
}

function AddGameModal({ owned, onAdd, onClose }: { owned: string[]; onAdd: (id: string) => Promise<unknown>; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 300)
  const [result, setResult] = useState<{ query: string; games: Boardgame[]; failed: boolean } | null>(null)
  const [adding, setAdding] = useState<string | null>(null)

  // Busca ao mudar o texto; a resposta guarda a busca que a gerou
  const [lastQuery, setLastQuery] = useState<string | null>(null)
  if (lastQuery !== query) {
    setLastQuery(query)
    listBoardgames({ name: query, size: 12 })
      .then((games) => setResult({ query, games, failed: false }))
      .catch(() => setResult({ query, games: [], failed: true }))
  }
  const loading = result?.query !== query

  return (
    <Modal open onClose={onClose} title="Adicionar jogo" lead="Escolha um jogo do catálogo para pôr na sua estante." size="lg">
      <SearchField id="busca-adicionar" label="Buscar jogo pelo nome" placeholder="Ex.: Catan" value={search} onChange={setSearch} />
      {result?.failed ? (
        <Alert tone="warn" size="sm" title="Não deu para buscar">Tente de novo em instantes.</Alert>
      ) : loading ? (
        <p className="shelf-status">Buscando…</p>
      ) : result && result.games.length === 0 ? (
        <p className="shelf-status">Nenhum jogo encontrado.</p>
      ) : (
        <ul className="shelf-pick">
          {result?.games.map((game) => {
            const has = owned.includes(game.id)
            return (
              <li key={game.id} className="shelf-pick__row">
                <span>{game.name}</span>
                {has ? (
                  <span className="shelf-card__meta">Na estante</span>
                ) : (
                  <Button
                    variant="secondary"
                    disabled={adding === game.id}
                    onClick={async () => {
                      setAdding(game.id)
                      try {
                        await onAdd(game.id)
                      } catch {
                        /* aviso na página */
                      } finally {
                        setAdding(null)
                      }
                    }}
                  >
                    {adding === game.id ? 'Adicionando…' : 'Adicionar'}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
