/**
 * Pedido de login vindo de qualquer lugar da interface (ex.: curtir sem estar logado).
 * O App registra quem abre a modal de login; assim os componentes não precisam receber onSignIn por props.
 */
let openLogin: (() => void) | null = null
/** Pedido feito antes de o App registrar a modal (uma página que pede login logo ao montar) */
let pending = false

export function registerLoginPrompt(handler: () => void) {
  openLogin = handler
  if (pending) {
    pending = false
    handler()
  }
  return () => {
    if (openLogin === handler) openLogin = null
  }
}

/** Para onde ir depois que a pessoa entrar (ex.: o anúncio em que ela clicou como visitante) */
let destination: string | null = null

function open() {
  if (openLogin) openLogin()
  else pending = true
}

/** Abre a modal de login; depois de entrar, a pessoa continua onde está */
export function requestLogin() {
  destination = null
  open()
}

/** Abre a modal de login; assim que a pessoa entrar, o App a leva para {@code afterLogin} */
export function requestLoginThen(afterLogin: string) {
  destination = afterLogin
  open()
}

/** O destino pedido no último requestLogin (uma vez só) */
export function takeLoginDestination(): string | null {
  const target = destination
  destination = null
  return target
}
