import { useLoginController } from '../../../controllers/useLoginController'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { PasswordField } from '../../components/TextField/PasswordField'
import { TextField } from '../../components/TextField/TextField'
import './AuthForm.css'

type LoginModalProps = {
  onLogin: (email: string, token: string) => void
  onClose: () => void
  onSwitchToRegister: () => void
}

export function LoginModal({ onLogin, onClose, onSwitchToRegister }: LoginModalProps) {
  const { email, setEmail, password, setPassword, isLoading, error, submit } = useLoginController(onLogin)

  return (
    <Modal open onClose={onClose} title="Entrar" lead="Acesse sua estante, suas partidas e seus jogos.">
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && (
          <Alert tone="warn" size="sm" title="Não deu para entrar">
            {error}
          </Alert>
        )}
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={setEmail}
          initialFocus
        />
        <PasswordField label="Senha" autoComplete="current-password" value={password} onChange={setPassword} />
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="auth-form__switch">
        Ainda não tem conta?{' '}
        <Button variant="link" onClick={onSwitchToRegister}>
          Cadastre-se
        </Button>
      </p>
    </Modal>
  )
}
