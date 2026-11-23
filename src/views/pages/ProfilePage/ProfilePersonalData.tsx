import { useState, type FormEvent } from 'react'
import type { User } from '../../../models/services/accountService'
import { updateUser } from '../../../models/services/accountService'
import { ApiError } from '../../../models/services/apiClient'
import { getUserProfileExtras, saveUserProfileExtras, type UserProfileExtras } from '../../../models/session'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/TextField/TextField'
import {
  computeProfilePatch,
  MAX_BIO_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  validateProfileData,
} from './profileUtils'

type ProfilePersonalDataProps = {
  user: User
  onSaved: (name: string, email: string) => void
}

export function ProfilePersonalData({ user, onSaved }: ProfilePersonalDataProps) {
  const [current, setCurrent] = useState(user)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)

  // Campos adicionais do perfil do jogador
  const initialExtras = getUserProfileExtras(user.id)
  const [bio, setBio] = useState(initialExtras.bio || '')
  const [city, setCity] = useState(initialExtras.city || '')
  const [favoriteGenres, setFavoriteGenres] = useState(initialExtras.favoriteGenres || '')
  const [experienceLevel, setExperienceLevel] = useState<UserProfileExtras['experienceLevel']>(
    initialExtras.experienceLevel || 'Intermediário'
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setDone(false)

    const validation = validateProfileData(name, email)
    if (!validation.valid) {
      return setError(validation.error)
    }

    const cleanName = validation.cleanName!
    const cleanEmail = validation.cleanEmail!
    const patch = computeProfilePatch(current, { name: cleanName, email: cleanEmail })

    setSaving(true)
    setError(null)

    try {
      if (patch.name || patch.email) {
        const saved = await updateUser(current.id, patch)
        setCurrent(saved)
        setName(saved.name)
        setEmail(saved.email)
        onSaved(saved.name, saved.email)
      }

      // Salva campos adicionais do perfil
      saveUserProfileExtras(
        {
          bio: bio.trim(),
          city: city.trim(),
          favoriteGenres: favoriteGenres.trim(),
          experienceLevel,
        },
        user.id
      )

      setDone(true)
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Já existe uma conta com esse e-mail.'
          : 'Não deu para salvar. Confira os dados e tente de novo.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="account__section" aria-labelledby="perfil-dados-title">
      <div>
        <h2 id="perfil-dados-title">Dados Pessoais</h2>
        <p>Atualize suas informações de contato e preferências na comunidade.</p>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate>
        {error && <Alert tone="warn" size="sm" title="Ops">{error}</Alert>}
        {done && <Alert size="sm" title="Pronto">Perfil atualizado com sucesso.</Alert>}

        <TextField
          label="Nome"
          value={name}
          onChange={setName}
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
        />

        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          maxLength={MAX_EMAIL_LENGTH}
        />

        <div className="profile-field-row">
          <TextField
            label="Cidade / Região"
            placeholder="Ex.: Blumenau - SC"
            value={city}
            onChange={setCity}
            maxLength={100}
          />

          <div className="profile-select">
            <label htmlFor="perfil-experiencia">Nível de Experiência</label>
            <select
              id="perfil-experiencia"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as UserProfileExtras['experienceLevel'])}
            >
              <option value="Iniciante">Iniciante (começando no hobby)</option>
              <option value="Intermediário">Intermediário (joga regularmente)</option>
              <option value="Veterano">Veterano (colecionador experiente)</option>
            </select>
          </div>
        </div>

        <TextField
          label="Jogos & Estilos Favoritos"
          placeholder="Ex.: Eurogames, Catan, Terraforming Mars, Party games"
          value={favoriteGenres}
          onChange={setFavoriteGenres}
          maxLength={200}
        />

        <div className="profile-textarea">
          <label htmlFor="perfil-bio">Sobre você (Bio)</label>
          <textarea
            id="perfil-bio"
            rows={3}
            placeholder="Conte um pouco sobre suas preferências, histórico de jogatinas ou disponibilidade para mesas…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={MAX_BIO_LENGTH}
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </form>
    </section>
  )
}
