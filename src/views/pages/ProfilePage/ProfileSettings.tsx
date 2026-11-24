import { useState, type FormEvent } from 'react'
import { useTheme } from '../../../controllers/useTheme'
import { PASSWORD_MAX, PASSWORD_MIN } from '../../../models/services/authService'
import { ApiError } from '../../../models/services/apiClient'
import { changePassword, deleteAccount } from '../../../models/services/accountService'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { MoonIcon, SunIcon } from '../../components/Icons/Icons'
import { Modal } from '../../components/Modal/Modal'
import { PasswordField } from '../../components/TextField/PasswordField'
import { Switch } from '../../components/Switch/Switch'
import { FormActions } from '../../components/FormActions/FormActions'

/* Configurações da conta, dentro do Meu Perfil (antes ficavam em /configuracoes) */

export function AppearanceSection() {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <section className="account__section" aria-labelledby="cfg-aparencia">
      <div>
        <h2 id="cfg-aparencia">Aparência</h2>
        <p>Escolha como o Blue Hawk aparece neste aparelho.</p>
      </div>
      <div className="profile-theme-preview" aria-hidden="true">
        <span className={dark ? 'profile-theme-swatch profile-theme-swatch--dark is-on' : 'profile-theme-swatch profile-theme-swatch--dark'}>
          <MoonIcon />
          Noite
        </span>
        <span className={dark ? 'profile-theme-swatch profile-theme-swatch--light' : 'profile-theme-swatch profile-theme-swatch--light is-on'}>
          <SunIcon />
          Giz
        </span>
      </div>
      <div className="account__row">
        <span id="cfg-tema">Modo escuro</span>
        <Switch checked={dark} onChange={toggleTheme} labelledBy="cfg-tema" />
      </div>
    </section>
  )
}

export function PasswordSection({ userId }: { userId: string }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setDone(false)
    if (!current) return setError('Informe a senha atual.')
    if (next.length < PASSWORD_MIN) return setError(`A nova senha precisa de pelo menos ${PASSWORD_MIN} caracteres.`)
    if (next.length > PASSWORD_MAX) return setError(`A nova senha pode ter até ${PASSWORD_MAX} caracteres.`)
    if (next !== confirm) return setError('As senhas não coincidem.')
    if (next === current) return setError('A nova senha deve ser diferente da atual.')

    setSaving(true)
    setError(null)
    try {
      await changePassword(userId, current, next)
      setCurrent('')
      setNext('')
      setConfirm('')
      setDone(true)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'A senha atual está incorreta.'
          : 'Não deu para trocar a senha. Tente de novo.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="account__section" aria-labelledby="cfg-senha">
      <h2 id="cfg-senha">Alterar senha</h2>
      <form className="auth-form" onSubmit={submit} noValidate>
        {error && <Alert tone="warn" size="sm" title="Ops">{error}</Alert>}
        {done && <Alert size="sm" title="Pronto">Senha alterada.</Alert>}
        <PasswordField label="Senha atual" autoComplete="current-password" value={current} onChange={setCurrent} />
        <PasswordField label="Nova senha" autoComplete="new-password" value={next} onChange={setNext} hint={`De ${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres`} />
        <PasswordField label="Confirmar nova senha" autoComplete="new-password" value={confirm} onChange={setConfirm} />
        <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Alterar senha'}</Button>
      </form>
    </section>
  )
}

export function DeleteSection({ userId, onDeleted }: { userId: string; onDeleted: () => void }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirm() {
    setDeleting(true)
    setError(null)
    try {
      await deleteAccount(userId)
      onDeleted()
      window.location.assign('/')
    } catch {
      setError('Não deu para excluir a conta. Tente de novo.')
      setDeleting(false)
    }
  }

  return (
    <section className="account__section account__danger" aria-labelledby="cfg-excluir">
      <h2 id="cfg-excluir">Excluir conta</h2>
      <p>Apaga a sua conta, a sua estante, as suas ofertas e as partidas que você criou. Não dá para desfazer.</p>
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>Excluir minha conta</Button>
      </div>
      {open && (
        <Modal open onClose={() => !deleting && setOpen(false)} title="Excluir a conta?" lead="Tudo o que é seu será apagado.">
          <div className="auth-form">
            {error && <Alert tone="warn" size="sm" title="Ops">{error}</Alert>}
            <FormActions onCancel={() => setOpen(false)} busy={deleting}>
              <Button onClick={confirm} disabled={deleting}>{deleting ? 'Excluindo…' : 'Sim, excluir tudo'}</Button>
            </FormActions>
          </div>
        </Modal>
      )}
    </section>
  )
}
