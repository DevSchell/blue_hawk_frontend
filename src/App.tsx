import { useAuthController } from './controllers/useAuthController'
import { LoginModal } from './views/features/auth/LoginModal'
import { RegisterModal } from './views/features/auth/RegisterModal'
import { AppLayout } from './views/layout/AppLayout'
import { currentNavItem } from './views/layout/navigation'
import { ComingSoonPage } from './views/pages/ComingSoonPage/ComingSoonPage'
import { FeedPage } from './views/pages/FeedPage/FeedPage'

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
    logout,
  } = useAuthController()
  const page = currentNavItem()

  return (
    <AppLayout session={session} onSignIn={openLogin} onSignOut={logout}>
      {page.href === '/' ? (
        // Remonta o feed ao entrar/sair, para buscar de novo com (ou sem) o token
        <FeedPage key={session?.email ?? 'visitante'} />
      ) : (
        <ComingSoonPage title={page.label} />
      )}
      {isLoginOpen && <LoginModal onLogin={completeLogin} onClose={closeLogin} onSwitchToRegister={openRegister} />}
      {isRegisterOpen && (
        <RegisterModal onRegister={completeLogin} onClose={closeRegister} onSwitchToLogin={openLogin} />
      )}
    </AppLayout>
  )
}

export default App
