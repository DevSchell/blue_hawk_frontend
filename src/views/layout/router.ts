import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

/**
 * Navegação dentro do app, sem recarregar a página: a topbar fica, só o conteúdo troca,
 * com uma View Transition na mesma página (quando o navegador suporta).
 */

/** Disparado depois de cada troca de tela feita por navigate() */
export const NAVIGATE_EVENT = 'bluehawk:navigate'

/** Telas abertas dentro do app nesta aba: com alguma, "voltar" usa o histórico */
let inAppDepth = 0

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Anima a troca só com a aba visível e sem pedido de menos movimento (aba oculta pausa a animação) */
const canAnimate = (doc: ViewTransitionDocument) =>
  Boolean(doc.startViewTransition) && !prefersReducedMotion() && document.visibilityState === 'visible'


/** Vai para um endereço do app. Externo (outra origem) cai na navegação normal do navegador. */
export function navigate(to: string, options: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.href)
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href)
    return
  }

  const update = () => {
    const target = `${url.pathname}${url.search}${url.hash}`
    if (options.replace) window.history.replaceState(null, '', target)
    else {
      window.history.pushState(null, '', target)
      inAppDepth += 1
    }
    // Avisa o App (e os modais globais) e já aplica a tela nova, para a transição "fotografar" o resultado
    flushSync(() => {
      window.dispatchEvent(new Event(NAVIGATE_EVENT))
    })
    const anchor = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null
    if (anchor) anchor.scrollIntoView()
    else window.scrollTo(0, 0)
  }

  const doc = document as ViewTransitionDocument
  if (canAnimate(doc)) doc.startViewTransition!(update)
  else update()
}

/**
 * Voltar/avançar do navegador: o endereço já mudou, mas a tela ainda é a antiga. Repassa como uma
 * navegação, dentro da mesma transição das trocas feitas por clique.
 */
let popstateBridge = false
function bridgePopstate() {
  if (popstateBridge) return
  popstateBridge = true
  window.addEventListener('popstate', () => {
    const update = () => {
      flushSync(() => {
        window.dispatchEvent(new Event(NAVIGATE_EVENT))
      })
    }
    const doc = document as ViewTransitionDocument
    if (canAnimate(doc)) doc.startViewTransition!(update)
    else update()
  })
}

function subscribe(onChange: () => void) {
  bridgePopstate()
  window.addEventListener(NAVIGATE_EVENT, onChange)
  return () => window.removeEventListener(NAVIGATE_EVENT, onChange)
}

/** Endereço atual (caminho + busca): muda a cada navegação, voltar e avançar */
export function useLocationKey() {
  return useSyncExternalStore(
    subscribe,
    () => `${window.location.pathname}${window.location.search}`,
    () => '/',
  )
}

/** Chama {@code onNavigate} a cada troca de tela (ex.: para fechar um modal global) */
export function onNavigation(onNavigate: () => void) {
  window.addEventListener(NAVIGATE_EVENT, onNavigate)
  return () => window.removeEventListener(NAVIGATE_EVENT, onNavigate)
}

/**
 * Clique em link interno vira navegação do app. Ficam com o navegador: Ctrl/Cmd/Shift/Alt + clique,
 * botão do meio, target="_blank", download, outra origem e salto para âncora na mesma tela.
 */
export function interceptLinkClicks() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const anchor = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!anchor) return
    if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return
    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin) return
    const sameScreen = url.pathname === window.location.pathname && url.search === window.location.search
    if (sameScreen && url.hash) return
    e.preventDefault()
    // Link para a própria tela: só volta ao topo
    if (sameScreen) {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      return
    }
    navigate(`${url.pathname}${url.search}${url.hash}`)
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}

/**
 * Volta uma tela: pelo histórico, se a pessoa chegou aqui navegando no app; senão (link aberto direto),
 * vai para {@code fallback} (ex.: a Loja ou a Wiki).
 */
export function goBack(fallback: string) {
  if (inAppDepth > 0) {
    inAppDepth -= 1
    window.history.back()
  } else {
    navigate(fallback, { replace: true })
  }
}
