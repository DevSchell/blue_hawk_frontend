import { useRegisterController } from '../../../controllers/useRegisterController'
import { PASSWORD_MIN } from '../../../models/services/authService'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { PasswordField } from '../../components/TextField/PasswordField'
import { TextField } from '../../components/TextField/TextField'
import { PRIVACY_PATH, TERMS_PATH } from '../../layout/navigation'
import './AuthForm.css'

type RegisterModalProps = {
  onRegister: (email: string, token: string) => void
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ onRegister, onClose, onSwitchToLogin }: RegisterModalProps) {
  const c = useRegisterController(onRegister)

  return (
    <Modal open onClose={onClose} title="Criar conta" lead="Monte sua estante e encontre gente para jogar.">
      <form className="auth-form" onSubmit={c.submit} noValidate>
        {c.error && (
          <Alert tone="warn" size="sm" title="Não deu para cadastrar">
            {c.error}
          </Alert>
        )}
        <TextField
          label="Nome"
          autoComplete="name"
          placeholder="Como quer ser chamado"
          value={c.name}
          onChange={c.setName}
          initialFocus
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={c.email}
          onChange={c.setEmail}
        />
        <PasswordField
          label="Senha"
          autoComplete="new-password"
          hint={`Mínimo de ${PASSWORD_MIN} caracteres.`}
          value={c.password}
          onChange={c.setPassword}
        />
        <PasswordField
          label="Confirmar senha"
          autoComplete="new-password"
          value={c.confirmPassword}
          onChange={c.setConfirmPassword}
        />
        {/* Os links abrem em outra aba para a pessoa não perder o que já preencheu */}
        <label className="auth-form__consent">
          <input
            type="checkbox"
            checked={c.acceptedTerms}
            onChange={(e) => c.setAcceptedTerms(e.target.checked)}
          />
          <span>
            Li e aceito os{' '}
            <a href={TERMS_PATH} target="_blank" rel="noopener">
              Termos de Uso
            </a>{' '}
            e a{' '}
            <a href={PRIVACY_PATH} target="_blank" rel="noopener">
              Política de Privacidade
            </a>
            .
          </span>
        </label>
        <Button type="submit" fullWidth disabled={c.isLoading}>
          {c.isLoading ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>

      <p className="auth-form__switch">
        Já tem conta?{' '}
        <Button variant="link" onClick={onSwitchToLogin}>
          Entrar
        </Button>
      </p>
    </Modal>
  )
}
