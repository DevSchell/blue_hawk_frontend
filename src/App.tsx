import { useAuthController } from './controllers/useAuthController'
import { LoginModal } from './views/features/auth/LoginModal'
import { RegisterModal } from './views/features/auth/RegisterModal'
import { AppLayout } from './views/layout/AppLayout'
import { ACCOUNT_ROUTES, currentPath } from './views/layout/navigation'
import { FeedPage } from './views/pages/FeedPage/FeedPage'
import { MatchesPage } from './views/pages/MatchesPage/MatchesPage'
import { ProfilePage } from './views/pages/ProfilePage/ProfilePage'
import { SettingsPage } from './views/pages/SettingsPage/SettingsPage'
import { ShelfPage } from './views/pages/ShelfPage/ShelfPage'
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
  const path = currentPath()
  // Remonta a página ao entrar/sair, para buscar de novo com (ou sem) o token
  const pageKey = session?.email ?? 'visitante'

  return (
    <AppLayout session={session} onSignIn={openLogin} onSignOut={logout}>
      {path === '/loja' ? (
        <StorePage key={pageKey} signedIn={Boolean(session)} onSignIn={openLogin} />
      ) : path === ACCOUNT_ROUTES.shelf ? (
        <ShelfPage
          key={pageKey}
          onSignIn={openLogin}
          onGoToFeed={() => {
            window.location.href = '/'
          }}
        />
      ) : path === ACCOUNT_ROUTES.matches ? (
        <MatchesPage key={pageKey} onSignIn={openLogin} />
      ) : path === ACCOUNT_ROUTES.profile ? (
        <ProfilePage onSignIn={openLogin} onProfileChange={updateProfile} />
      ) : path === ACCOUNT_ROUTES.settings ? (
        <SettingsPage key={pageKey} onSignIn={openLogin} onSignOut={logout} />
      ) : (
        <FeedPage key={pageKey} />
      )}
      {isLoginOpen && <LoginModal onLogin={completeLogin} onClose={closeLogin} onSwitchToRegister={openRegister} />}
      {isRegisterOpen && (
        <RegisterModal onRegister={completeLogin} onClose={closeRegister} onSwitchToLogin={openLogin} />
      )}
    </AppLayout>
  )
}

export default App
