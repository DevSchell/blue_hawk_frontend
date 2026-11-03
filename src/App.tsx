import { useAuthController } from './controllers/useAuthController'
import { AppLayout } from './views/layout/AppLayout'
import { FeedPage } from './views/pages/FeedPage/FeedPage'
import LoginPage from './views/pages/LoginPage/LoginPage'
import RegisterPage from './views/pages/RegisterPage/RegisterPage'

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
      {isLoginOpen && (
        <LoginPage
          onLogin={completeLogin}
          onClose={closeLogin}
          onSwitchToRegister={openRegister}
        />
      )}
      {isRegisterOpen && (
        <RegisterPage
          onRegister={completeLogin}
          onClose={closeRegister}
          onSwitchToLogin={openLogin}
        />
      )}
    </AppLayout>
  )
}

export default App
