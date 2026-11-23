/**
 * Pedido de login vindo de qualquer lugar da interface (ex.: curtir sem estar logado).
 * O App registra quem abre a modal de login; assim os componentes não precisam receber onSignIn por props.
 */
let openLogin: (() => void) | null = null

export function registerLoginPrompt(handler: () => void) {
  openLogin = handler
  return () => {
    if (openLogin === handler) openLogin = null
  }
}

export function requestLogin() {
  openLogin?.()
}
