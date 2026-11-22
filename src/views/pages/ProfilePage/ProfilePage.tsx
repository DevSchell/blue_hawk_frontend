import { useState, type FormEvent } from 'react'
import { useAsyncList } from '../../../controllers/useAsyncList'
import { ApiError } from '../../../models/services/apiClient'
import { getUser, updateUser, type User } from '../../../models/services/accountService'
import { readUserId } from '../../../models/session'
import { Alert } from '../../components/Alert/Alert'
import { Avatar } from '../../components/Avatar/Avatar'
import { Raven } from '../../components/Brand/Raven'
import { Button } from '../../components/Button/Button'
import { Container } from '../../components/Container/Container'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { TextField } from '../../components/TextField/TextField'
import '../FeedPage/FeedPage.css'
import '../AccountPages.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX = 150

type ProfilePageProps = {
  onSignIn: () => void
  onProfileChange: (name: string, email: string) => void
}

/** Meu Perfil: nome e e-mail da conta */
export function ProfilePage({ onSignIn, onProfileChange }: ProfilePageProps) {
  const userId = readUserId()
  const user = useAsyncList((signal) => (userId ? getUser(userId, signal) : Promise.resolve(null)))

  return (
    <main className="feed-page">
      <Container>
        <h1 className="feed-page__title">Meu Perfil</h1>
        {!userId ? (
          <EmptyState icon={<Raven variant="noite" />} title="Entre para ver o seu perfil">
            Seus dados ficam salvos na sua conta.
            <span className="shelf-empty__action">
              <Button onClick={onSignIn}>Entrar</Button>
            </span>
          </EmptyState>
        ) : user.error ? (
          <Alert title="Não deu para carregar" tone="warn" action={<Button variant="link" onClick={user.reload}>Tentar de novo</Button>}>
            Verifique a conexão e tente outra vez.
          </Alert>
        ) : user.data ? (
          <ProfileForm user={user.data} onSaved={onProfileChange} />
        ) : (
          <p className="shelf-status" aria-busy="true">Carregando perfil…</p>
        )}
      </Container>
    </main>
  )
}

function ProfileForm({ user, onSaved }: { user: User; onSaved: (name: string, email: string) => void }) {
  const [current, setCurrent] = useState(user)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setDone(false)
    const cleanName = name.trim()
    const cleanEmail = email.trim()
    if (!cleanName) return setError('Informe o seu nome.')
    if (cleanName.length > MAX) return setError(`O nome pode ter até ${MAX} caracteres.`)
    if (!EMAIL_PATTERN.test(cleanEmail) || cleanEmail.length > MAX) return setError('Informe um e-mail válido.')

    // A API recusa reenviar o e-mail atual (conflito): manda só o que mudou
    const patch: { name?: string; email?: string } = {}
    if (cleanName !== current.name) patch.name = cleanName
    if (cleanEmail !== current.email) patch.email = cleanEmail
    if (!patch.name && !patch.email) return setError('Nada para salvar: os dados não mudaram.')

    setSaving(true)
    setError(null)
    try {
      const saved = await updateUser(current.id, patch)
      setCurrent(saved)
      setName(saved.name)
      setEmail(saved.email)
      onSaved(saved.name, saved.email)
      setDone(true)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Já existe uma conta com esse e-mail.'
          : 'Não deu para salvar. Confira os dados e tente de novo.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account">
      <section className="account__section" aria-label="Conta">
        <div className="account__identity">
          <Avatar name={current.name} size="lg" />
          <div>
            <small>{current.role === 'ADMIN' ? 'Administrador' : 'Jogador'}</small>
            <b>{current.name}</b>
          </div>
        </div>
      </section>
      <section className="account__section" aria-labelledby="perfil-dados">
        <h2 id="perfil-dados">Seus dados</h2>
        <form className="auth-form" onSubmit={submit} noValidate>
          {error && <Alert tone="warn" size="sm" title="Ops">{error}</Alert>}
          {done && <Alert size="sm" title="Pronto">Perfil atualizado.</Alert>}
          <TextField label="Nome" value={name} onChange={setName} autoComplete="name" maxLength={MAX} />
          <TextField label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" maxLength={MAX} />
          <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
        </form>
      </section>
    </div>
  )
}
