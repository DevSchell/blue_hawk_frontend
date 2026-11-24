import { useEffect } from 'react'
import { useAuthController } from './controllers/useAuthController'
import { registerLoginPrompt } from './models/loginPrompt'
import { LoginModal } from './views/features/auth/LoginModal'
import { RegisterModal } from './views/features/auth/RegisterModal'
import { AppLayout } from './views/layout/AppLayout'
import { interceptLinkClicks, navigate, useLocationKey } from './views/layout/router'
import {
  ACCOUNT_ROUTES,
  currentPath,
  GAME_PATH_PREFIX,
  MATCH_PATH_PREFIX,
  matchPath,
  idFromPath,
  MY_MATCHES_PATH,
  PLAY_PATH,
  PRIVACY_PATH,
  REVIEW_PATH,
  STORE_OFFER_PATH_PREFIX,
  storeOfferPath,
  CATEGORY_PATH_PREFIX,
  categoryPath,
  STORE_CATEGORY_PATH_PREFIX,
  storeCategoryPath,
  TERMS_PATH,
} from './views/layout/navigation'
import { CategoryPage } from './views/pages/CategoryPage/CategoryPage'
import { FeedPage } from './views/pages/FeedPage/FeedPage'
import { GamePage } from './views/pages/GamePage/GamePage'
import { LegalPage } from './views/pages/LegalPage/LegalPage'
import { PRIVACY, TERMS } from './views/pages/LegalPage/legalContent'
import { PlayPage } from './views/pages/PlayPage/PlayPage'
import { ProfilePage } from './views/pages/ProfilePage/ProfilePage'
import { ReviewPage } from './views/pages/ReviewPage/ReviewPage'
import { ShelfPage } from './views/pages/ShelfPage/ShelfPage'
import { StoreCategoryPage } from './views/pages/StoreCategoryPage/StoreCategoryPage'
import { StoreOfferPage } from './views/pages/StoreOfferPage/StoreOfferPage'
import { MatchPage } from './views/pages/MatchPage/MatchPage'
import { StorePage } from './views/pages/StorePage/StorePage'

function App() {
  const {
    session,
    isLoginOpen,
    isRegisterOpen,
    openLogin,
    closeLogin,
    openRegister,
    closeRegister,
    completeLogin,
    updateProfile,
    logout,
  } = useAuthController()
  // A rota vem do endereço; links internos trocam de tela sem recarregar (router.ts)
  const locationKey = useLocationKey()
  const path = currentPath()

  useEffect(() => interceptLinkClicks(), [])

  // Qualquer parte da interface pode pedir login (ex.: curtir sem estar logado)
  useEffect(() => registerLoginPrompt(openLogin), [openLogin])

  // "Minhas Partidas" agora é a aba do Jogue: o endereço antigo continua funcionando
  useEffect(() => {
    if (path === ACCOUNT_ROUTES.matches) navigate(MY_MATCHES_PATH, { replace: true })
    // Links antigos da Loja (?anuncio=) vão para a página do anúncio
    const oldOffer = path === '/loja' ? new URLSearchParams(window.location.search).get('anuncio') : null
    if (oldOffer) navigate(storeOfferPath(oldOffer), { replace: true })
    // Filtro antigo por categoria (?categoria=) vira a página da categoria
    const oldCategory = new URLSearchParams(window.location.search).get('categoria')
    if (oldCategory && path === '/') navigate(categoryPath(oldCategory), { replace: true })
    if (oldCategory && path === '/loja') navigate(storeCategoryPath(oldCategory), { replace: true })
    // Links antigos da partida (/jogue?partida=&chat=) vão para a página da partida
    const oldMatch = path === PLAY_PATH ? new URLSearchParams(window.location.search) : null
    if (oldMatch?.get('partida')) navigate(matchPath(oldMatch.get('partida')!, oldMatch.get('chat')), { replace: true })
    // Configurações agora são subabas do Meu Perfil
    if (path === ACCOUNT_ROUTES.legacySettings) navigate(ACCOUNT_ROUTES.settings, { replace: true })
  }, [path, locationKey])

  // Remonta a página ao entrar/sair (busca de novo com ou sem o token) e a cada endereço novo
  // (as páginas leem ?aba=, ?categoria= etc. ao montar)
  const pageKey = `${session?.email ?? 'visitante'}\u0000${locationKey}`

  function renderPage() {
    // Páginas com id no endereço: jogo da Wiki e anúncio da Loja
    const gameId = idFromPath(GAME_PATH_PREFIX, path)
    if (gameId) return <GamePage key={`${pageKey}-${gameId}`} gameId={gameId} />
    const matchId = idFromPath(MATCH_PATH_PREFIX, path)
    if (matchId) return <MatchPage key={`${pageKey}-${matchId}`} matchId={matchId} onSignIn={openLogin} />
    const offerId = idFromPath(STORE_OFFER_PATH_PREFIX, path)
    if (offerId) return <StoreOfferPage key={`${pageKey}-${offerId}`} offerId={offerId} />
    // Páginas de categoria (a Loja antes: /loja/categoria é mais específico que /categoria)
    const storeCategory = idFromPath(STORE_CATEGORY_PATH_PREFIX, path)
    if (storeCategory) return <StoreCategoryPage key={pageKey} category={storeCategory} />
    const category = idFromPath(CATEGORY_PATH_PREFIX, path)
    if (category) return <CategoryPage key={pageKey} category={category} />

    switch (path) {
      case '/loja':
        return <StorePage key={pageKey} />
      case PLAY_PATH:
        return <PlayPage key={pageKey} onSignIn={openLogin} />
      case ACCOUNT_ROUTES.shelf:
        return (
          <ShelfPage
            key={pageKey}
            onSignIn={openLogin}
            onGoToFeed={() => {
              navigate('/')
            }}
          />
        )
      case ACCOUNT_ROUTES.matches:
      case ACCOUNT_ROUTES.legacySettings:
        // O efeito acima redireciona; nada a mostrar enquanto isso
        return null
      case ACCOUNT_ROUTES.profile:
        return <ProfilePage key={pageKey} onSignIn={openLogin} onProfileChange={updateProfile} onSignOut={logout} />
      case REVIEW_PATH:
        return <ReviewPage key={pageKey} onSignIn={openLogin} />
      case TERMS_PATH:
        return <LegalPage document={TERMS} path={TERMS_PATH} />
      case PRIVACY_PATH:
        return <LegalPage document={PRIVACY} path={PRIVACY_PATH} />
      default:
        return <FeedPage key={pageKey} />
    }
  }

  return (
    <AppLayout session={session} onSignIn={openLogin} onSignOut={logout}>
      {renderPage()}
      {isLoginOpen && <LoginModal onLogin={completeLogin} onClose={closeLogin} onSwitchToRegister={openRegister} />}
      {isRegisterOpen && (
        <RegisterModal onRegister={completeLogin} onClose={closeRegister} onSwitchToLogin={openLogin} />
      )}
    </AppLayout>
  )
}

export default App
