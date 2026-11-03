import { useAuthController } from './controllers/useAuthController'
import { LoginModal } from './views/features/auth/LoginModal'
import { RegisterModal } from './views/features/auth/RegisterModal'
import { AppLayout } from './views/layout/AppLayout'
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

  return (
    <AppLayout session={session} onSignIn={openLogin} onSignOut={logout}>
      {/* Remonta o feed ao entrar/sair, para buscar de novo com (ou sem) o token */}
      <FeedPage key={session?.email ?? 'visitante'} />
      {isLoginOpen && <LoginModal onLogin={completeLogin} onClose={closeLogin} onSwitchToRegister={openRegister} />}
      {isRegisterOpen && (
        <RegisterModal onRegister={completeLogin} onClose={closeRegister} onSwitchToLogin={openLogin} />
      )}
    </AppLayout>
  )
}

export default App
