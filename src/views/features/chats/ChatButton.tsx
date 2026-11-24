import { useEffect, useState } from 'react'
import { useInboxUnread } from '../../../controllers/useChatInbox'
import { OPEN_CHAT_EVENT, type ChatInboxFilter, type OpenChatDetail } from '../../../models/chatInbox'
import { IconButton } from '../../components/IconButton/IconButton'
import { ChatIcon } from '../../components/Icons/Icons'
import { ChatInboxModal } from './ChatInboxModal'
import { onNavigation } from '../../layout/router'
import './Chats.css'

type OpenState = { key?: string; filter?: ChatInboxFilter } | null

/** ?conversa=neg:{id} (link de notificação) abre a caixa direto na conversa */
function initialFromUrl(): OpenState {
  const key = new URLSearchParams(window.location.search).get('conversa')
  return key ? { key } : null
}

/**
 * Botão de chat da topbar, ao lado do sininho: mostra as mensagens não lidas e abre a caixa de conversas.
 * Outras telas abrem a caixa com openChatInbox() (ex.: depois de mandar uma proposta na Loja).
 */
export function ChatButton({ signedIn }: { signedIn: boolean }) {
  const unread = useInboxUnread(signedIn)
  const [open, setOpen] = useState<OpenState>(() => (signedIn ? initialFromUrl() : null))

  // Trocar de tela fecha a caixa de conversas (ex.: "Abrir partida"), a menos que o endereço novo
  // peça uma conversa (?conversa=, vindo de uma notificação)
  useEffect(() => onNavigation(() => setOpen(initialFromUrl())), [])

  useEffect(() => {
    if (!signedIn) return
    const onOpen = (e: Event) => setOpen({ ...(e as CustomEvent<OpenChatDetail>).detail })
    window.addEventListener(OPEN_CHAT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen)
  }, [signedIn])

  if (!signedIn) return null

  const label = unread.count > 0 ? `Conversas: ${unread.count} com mensagens novas` : 'Conversas'

  function close() {
    setOpen(null)
    unread.refresh()
    // Tira ?conversa da URL: recarregar não reabre a caixa
    const url = new URL(window.location.href)
    if (url.searchParams.has('conversa')) {
      url.searchParams.delete('conversa')
      window.history.replaceState(null, '', url)
    }
  }

  return (
    <>
      <span className="chat-button">
        <IconButton label={label} variant="ghost" aria-haspopup="dialog" onClick={() => setOpen({})}>
          <ChatIcon />
        </IconButton>
        {unread.count > 0 && (
          <span className="chat-button__count" aria-hidden="true">
            {unread.count > 99 ? '99+' : unread.count}
          </span>
        )}
      </span>
      {open && <ChatInboxModal initialKey={open.key} initialFilter={open.filter} onClose={close} />}
    </>
  )
}
