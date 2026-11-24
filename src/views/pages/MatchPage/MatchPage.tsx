import { useState, type ReactNode } from 'react'
import { useChatOverview } from '../../../controllers/useMatchChat'
import { useMatchPage } from '../../../controllers/useMatchPage'
import type { ChatTarget, ChatThread } from '../../../models/matchChat'
import type { OpenMatch } from '../../../models/openMatch'
import { readUserId } from '../../../models/session'
import { openUserProfile } from '../../../models/userProfile'
import { ApiError, apiUrl } from '../../../models/services/apiClient'
import { Avatar } from '../../components/Avatar/Avatar'
import { BackButton } from '../../components/BackButton/BackButton'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { ChatIcon, ClockIcon, MapPinIcon, UserIcon, UsersIcon } from '../../components/Icons/Icons'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { PillTabs } from '../../components/PillTabs/PillTabs'
import { GameCover } from '../../features/boardgames/GameCover'
import { CancelMatchModal } from '../../features/play/CancelMatchModal'
import { ChatThreadView } from '../../features/play/ChatThreadView'
import { formatMatchDate } from '../../features/play/format'
import { JoinMatchModal } from '../../features/play/JoinMatchModal'
import { JoinRequestsModal } from '../../features/play/JoinRequestsModal'
import { MatchActions } from '../../features/play/MatchActions'
import { gamePath, MY_MATCHES_PATH, PLAY_PATH } from '../../layout/navigation'
import { cx } from '../../utils/classNames'
import '../../features/play/MatchChat.css'
import '../ProductPage.css'
import './MatchPage.css'

type ChatTab = 'mesa' | 'chats'

const REQUEST_LABEL: Record<ChatThread['requestStatus'], string> = {
  PENDING: 'Pedido pendente',
  ACCEPTED: 'Na mesa',
  REJECTED: 'Recusado',
  CANCELLED: 'Desistiu',
  HOST: 'Host',
}

/**
 * Página da partida: a ficha (com quem está na mesa) numa coluna e os chats ocupando o resto da tela.
 * "Mesa" é aberta ao host e aos aceitos; as conversas privadas ligam duas pessoas da partida.
 */
export function MatchPage({ matchId, onSignIn }: { matchId: string; onSignIn: () => void }) {
  const c = useMatchPage(matchId)
  const match = c.match

  if (c.loading) {
    return (
      <main className="product-page match-page">
        <Container>
          <LoadingCard message="Abrindo a partida…" />
        </Container>
      </main>
    )
  }

  if (!match) {
    const missing = c.error instanceof ApiError && c.error.status === 404
    return (
      <main className="product-page match-page">
        <Container>
          <EmptyState
            icon={<Raven variant="noite" />}
            title={missing ? 'Partida não encontrada' : 'Não deu para abrir a partida'}
          >
            {missing ? 'Ela pode ter sido removida.' : 'Verifique a conexão e tente de novo.'}
          </EmptyState>
          <div className="match-page__error-actions">
            {missing ? (
              <a className="button" href={PLAY_PATH}>
                Voltar ao Jogue
              </a>
            ) : (
              <Button type="button" onClick={c.retry}>
                Tentar de novo
              </Button>
            )}
          </div>
        </Container>
      </main>
    )
  }

  const involved = c.signedIn && (match.isHost || match.myRequest !== null)
  const game = match.game
  const readOnly = match.status === 'CANCELLED'
  const actions = {
    signedIn: c.signedIn,
    busy: c.busy,
    onSignIn,
    onJoin: c.openJoin,
    onWithdraw: c.withdraw,
    onOpenRequests: c.openRequests,
    onCancel: c.cancel,
  }

  return (
    <main className="product-page match-page">
      <Container>
        <BackButton fallback={involved ? MY_MATCHES_PATH : PLAY_PATH} />
        <ol className="product-page__crumbs" aria-label="Você está em">
          <li>
            <a href={PLAY_PATH}>Jogue</a>
          </li>
          {involved && (
            <li>
              <a href={MY_MATCHES_PATH}>Minhas partidas</a>
            </li>
          )}
          <li aria-current="page">{game?.name ?? 'Partida'}</li>
        </ol>

        <div className="product-page__title-row">
          <h1 className="product-page__title">{game?.name ?? 'Partida'}</h1>
          {readOnly ? (
            <span className="badge match-page__status match-page__status--off">Cancelada</span>
          ) : (
            <span className="badge match-page__status">
              {match.seatsLeft > 0 ? `${match.seatsLeft} ${match.seatsLeft === 1 ? 'vaga' : 'vagas'}` : 'Mesa cheia'}
            </span>
          )}
        </div>

        <MatchBody
          // Remonta quando muda quem está na mesa (pedido aceito, desistência): conversas e permissões mudam
          key={`${match.status}-${match.players}-${match.myRequest?.status ?? ''}`}
          match={match}
          involved={involved}
          signedIn={c.signedIn}
          readOnly={readOnly}
          initialChat={c.initialChat}
          info={
            <>
              {game && (
                <a className="match-page__cover" href={gamePath(game.id)} aria-label={`Ver ${game.name} na Wiki`}>
                  <GameCover
                    id={game.id}
                    name={game.name}
                    preset={game.coverPreset}
                    imageUrl={game.coverImageUrl ? apiUrl(game.coverImageUrl) : null}
                  />
                </a>
              )}

              <ul className="match-page__facts">
                <li>
                  <ClockIcon />
                  <span className="match-page__date">{formatMatchDate(match.scheduledAt)}</span>
                </li>
                <li>
                  <MapPinIcon />
                  {match.city}
                </li>
                <li>
                  <UsersIcon />
                  {match.players}/{match.maxPlayers} jogadores
                </li>
              </ul>

              {readOnly && match.cancelReason && (
                <p className="match-page__cancel-reason">
                  <b>Cancelada pelo host:</b> {match.cancelReason}
                </p>
              )}

              {match.notes && <p className="match-page__notes">{match.notes}</p>}

              <div className="match-page__actions">
                <MatchActions match={match} {...actions} showWithdraw />
              </div>
            </>
          }
        />
      </Container>

      {c.joining && <JoinMatchModal match={match} onJoined={c.joined} onClose={c.closeJoin} />}
      {c.managing && <JoinRequestsModal match={match} onClose={c.closeRequests} />}
      {c.withdrawing && (
        <ConfirmModal
          title="Desistir da partida?"
          lead={match.game?.name ?? 'Partida'}
          confirmLabel="Desistir"
          busyLabel="Saindo…"
          onConfirm={c.confirmWithdraw}
          onClose={c.closeWithdraw}
        >
          Sua vaga é liberada e {match.host.name} é avisado. Para voltar, você precisa pedir de novo.
        </ConfirmModal>
      )}
      {c.cancelling && <CancelMatchModal match={match} onCancelled={c.cancelled} onClose={c.closeCancel} />}

      <div className="play-toast" aria-live="polite">
        {c.toast && <span>{c.toast}</span>}
      </div>
    </main>
  )
}

type MatchBodyProps = {
  match: OpenMatch
  involved: boolean
  signedIn: boolean
  readOnly: boolean
  initialChat: string | null
  /** Ficha da partida (capa, data, local, ações) */
  info: ReactNode
}

/**
 * Corpo da página: a ficha com "Na mesa" à esquerda e os chats à direita.
 * Passar o mouse numa pessoa da mesa mostra as ações: conversa privada e ver perfil.
 */
function MatchBody({ match, involved, signedIn, readOnly, initialChat, info }: MatchBodyProps) {
  const chat = useChatOverview(match.id, involved)
  const overview = involved ? chat.overview : null
  const me = readUserId()

  const [pickedTab, setPickedTab] = useState<ChatTab | null>(
    initialChat === 'mesa' ? 'mesa' : initialChat ? 'chats' : null,
  )
  const [pickedTarget, setPickedTarget] = useState<ChatTarget>(
    initialChat && initialChat !== 'mesa' ? initialChat : null,
  )

  const threads = overview?.threads ?? []
  const canTable = overview?.canUseTableChat ?? false
  // Sem escolha, abre a mesa (quando dá) e senão as conversas
  const tab: ChatTab = canTable && pickedTab !== 'chats' ? 'mesa' : 'chats'
  const target = threads.some((t) => t.userId === pickedTarget) ? pickedTarget : (threads[0]?.userId ?? null)
  const activeThread = threads.find((t) => t.userId === target)
  const chatUnread = threads.reduce((sum, t) => sum + t.unread, 0)
  const onlyHost = threads.length === 1 && threads[0].requestStatus === 'HOST'

  const tabs: { id: ChatTab; label: string; badge?: number }[] = [
    ...(canTable ? [{ id: 'mesa' as const, label: 'Mesa', badge: overview?.tableUnread || undefined }] : []),
    {
      id: 'chats' as const,
      label: onlyHost ? `Chat com ${match.host.name}` : 'Conversas privadas',
      badge: chatUnread || undefined,
    },
  ]

  /** Abre a conversa privada com alguém da mesa */
  const talkTo = (userId: string) => {
    setPickedTab('chats')
    setPickedTarget(userId)
  }

  // Quem está na mesa: host primeiro; quem ainda não vê a mesa (pedido pendente, visitante) vê só o host
  const members = overview?.members.length
    ? [...overview.members].sort((a, b) => Number(b.isHost) - Number(a.isHost))
    : [{ userId: match.host.id, name: match.host.name, isHost: true }]

  return (
    <div className="match-page__layout">
      <aside className="match-page__info" aria-label="Sobre a partida">
        {info}

        <section className="match-page__seats" aria-labelledby="na-mesa">
          <h2 id="na-mesa" className="match-page__seats-title">
            Na mesa{' '}
            <span>
              {match.players}/{match.maxPlayers}
            </span>
          </h2>
          <ul className="match-page__seat-list">
            {members.map((member) => {
              const isMe = member.userId === me
              const hasThread = threads.some((t) => t.userId === member.userId)
              return (
                <li key={member.userId} className={cx('match-page__seat', member.isHost && 'is-host')}>
                  <Avatar name={member.name} size="sm" photoUrl={apiUrl(`/users/${member.userId}/avatar`)} />
                  <span className="match-page__seat-text">
                    <span className="match-page__seat-name">{isMe ? `${member.name} (você)` : member.name}</span>
                    <span className="match-page__seat-role">{member.isHost ? 'Host' : 'Jogador'}</span>
                  </span>
                  {!isMe && (
                    <span className="match-page__seat-actions">
                      {hasThread && (
                        <button
                          type="button"
                          className="match-page__seat-action"
                          title="Conversa privada"
                          aria-label={`Conversa privada com ${member.name}`}
                          onClick={() => talkTo(member.userId)}
                        >
                          <ChatIcon />
                        </button>
                      )}
                      <button
                        type="button"
                        className="match-page__seat-action"
                        title="Ver perfil"
                        aria-label={`Ver perfil de ${member.name}`}
                        onClick={() => openUserProfile(member.userId)}
                      >
                        <UserIcon />
                      </button>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </aside>

      <section className="match-page__chat" aria-label="Chats da partida">
        {!involved ? (
          <div className="match-page__locked">
            <ChatIcon />
            <h2>Converse com a mesa</h2>
            <p>
              {signedIn
                ? 'Peça para entrar e o chat com o host abre aqui. Quem for aceito também entra no chat da mesa.'
                : 'Entre na sua conta para pedir vaga e conversar com o host.'}
            </p>
          </div>
        ) : chat.loading ? (
          <LoadingCard compact message="Abrindo os chats…" />
        ) : chat.error || !overview ? (
          <p className="match-page__empty">Não deu para abrir os chats agora.</p>
        ) : (
          <>
            <PillTabs<ChatTab> label="Chats da partida" tabs={tabs} value={tab} onChange={setPickedTab} />

            {tab === 'mesa' ? (
              <ChatThreadView
                key="mesa"
                matchId={match.id}
                target={null}
                label="a mesa"
                showSenderNames
                readOnly={readOnly}
                emptyText="Ninguém falou nada ainda. Combine os detalhes com a mesa!"
              />
            ) : threads.length === 0 ? (
              <p className="match-page__empty">Quando alguém pedir para entrar, a conversa aparece aqui.</p>
            ) : (
              <div className={cx('match-page__room', threads.length > 1 && 'match-page__room--people')}>
                {threads.length > 1 && (
                  <div className="match-page__people" role="group" aria-label="Conversar com">
                    {threads.map((thread) => (
                      <button
                        key={thread.userId}
                        type="button"
                        aria-pressed={thread.userId === target}
                        className={cx('match-page__person', thread.userId === target && 'is-on')}
                        onClick={() => setPickedTarget(thread.userId)}
                      >
                        <span className="match-page__person-name">{thread.name}</span>
                        <span className="match-page__person-status">{REQUEST_LABEL[thread.requestStatus]}</span>
                        {thread.unread > 0 && (
                          <span className="match-page__person-unread" aria-label={`${thread.unread} não lidas`}>
                            {thread.unread}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {target && activeThread && (
                  <ChatThreadView
                    key={target}
                    matchId={match.id}
                    target={target}
                    label={activeThread.name}
                    showSenderNames={false}
                    readOnly={readOnly}
                    emptyText={`Mande um oi para ${activeThread.name}.`}
                  />
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
