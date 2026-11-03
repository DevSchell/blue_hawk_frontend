import { useAuthController } from './controllers/useAuthController'
import { AppLayout } from './views/layout/AppLayout'
import { FeedPage } from './views/pages/FeedPage/FeedPage'
import LoginPage from './views/pages/LoginPage/LoginPage'

function App() {
  const { session, isLoginOpen, openLogin, closeLogin, completeLogin, logout } = useAuthController()

  return (
    <AppLayout session={session} onSignIn={openLogin} onSignOut={logout}>
      {/* Remonta o feed ao entrar/sair, para buscar de novo com (ou sem) o token */}
      <FeedPage key={session?.email ?? 'visitante'} />
      {isLoginOpen && <LoginPage onLogin={completeLogin} onClose={closeLogin} />}
    </AppLayout>
  )
}

export default App
