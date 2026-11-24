import { useRef, useState, type ChangeEvent } from 'react'
import type { MyProfileController } from '../../../controllers/useMyProfile'
import { AVATAR_PRESETS } from '../../../models/avatarPresets'
import type { User } from '../../../models/services/accountService'
import { avatarImageOf } from '../../../models/services/userProfileService'
import { Alert } from '../../components/Alert/Alert'
import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { CheckIcon, TrashIcon, UploadIcon } from '../../components/Icons/Icons'
import { LoadingCard } from '../../components/LoadingCard/LoadingCard'
import { validatePhotoFile } from './profileUtils'
import { FormActions } from '../../components/FormActions/FormActions'

type ProfilePhotoEditorProps = {
  user: User
  myProfile: MyProfileController
}

/** Pré-visualização do que ainda não foi salvo: uma ilustração escolhida ou um arquivo enviado */
type Draft = { kind: 'preset'; presetId: string; image: string } | { kind: 'file'; file: File; image: string } | null

/** Foto de perfil: enviar uma imagem ou escolher uma ilustração do Blue Hawk. Fica salva na conta. */
export function ProfilePhotoEditor({ user, myProfile }: ProfilePhotoEditorProps) {
  const [draft, setDraft] = useState<Draft>(null)
  const [feedback, setFeedback] = useState<{ tone: 'info' | 'warn'; message: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!myProfile.profile) {
    return myProfile.error ? (
      <Alert
        tone="warn"
        size="sm"
        title="Não deu para carregar"
        action={
          <Button variant="link" onClick={myProfile.reload}>
            Tentar de novo
          </Button>
        }
      >
        Sua foto de perfil não pôde ser carregada.
      </Alert>
    ) : (
      <LoadingCard compact message="Carregando sua foto…" />
    )
  }

  const saved = avatarImageOf(myProfile.profile)
  const preview = draft ? draft.image : saved
  const selectedPreset = draft?.kind === 'preset' ? draft.presetId : draft ? null : myProfile.profile.avatarPreset

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const validation = validatePhotoFile(file)
    if (!validation.valid) {
      setFeedback({ tone: 'warn', message: validation.error! })
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setDraft({ kind: 'file', file, image: event.target?.result as string })
      setFeedback(null)
    }
    reader.onerror = () => setFeedback({ tone: 'warn', message: 'Não foi possível ler a imagem selecionada.' })
    reader.readAsDataURL(file)
  }

  async function run(action: () => Promise<unknown>, success: string) {
    setSaving(true)
    setFeedback(null)
    try {
      await action()
      setDraft(null)
      setFeedback({ tone: 'info', message: success })
    } catch {
      setFeedback({ tone: 'warn', message: 'Não deu para salvar a foto. Tente de novo.' })
    } finally {
      setSaving(false)
    }
  }

  function handleSave() {
    if (!draft) return
    if (draft.kind === 'file') void run(() => myProfile.uploadPhoto(draft.file), 'Foto de perfil salva!')
    else void run(() => myProfile.save({ avatarPreset: draft.presetId }), 'Avatar salvo!')
  }

  return (
    <section className="account__section profile-photo-editor" aria-labelledby="perfil-foto-title">
      <div>
        <h2 id="perfil-foto-title">Foto de Perfil</h2>
        <p>Personalize a sua imagem de exibição na comunidade Blue Hawk.</p>
      </div>

      {feedback && (
        <Alert tone={feedback.tone} size="sm" title={feedback.tone === 'warn' ? 'Atenção' : 'Pronto'}>
          {feedback.message}
        </Alert>
      )}

      <div className="profile-photo-preview">
        <Avatar name={user.name} size="xl" photoUrl={preview} />
        <div className="profile-photo-preview__info">
          <h3>{draft ? 'Pré-visualização (ainda não salva)' : 'Sua foto atual'}</h3>
          <p>
            {preview
              ? 'Esta imagem aparece no topo, no seu perfil público e nas conversas.'
              : 'Você está usando o avatar padrão com suas iniciais em açafrão.'}
          </p>
          <div className="profile-photo-actions" style={{ marginTop: '14px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon />
              Carregar imagem
            </Button>

            {saved && !draft && (
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() =>
                  run(() => myProfile.removePhoto(), 'Foto removida. Suas iniciais voltaram a ser exibidas.')
                }
              >
                <TrashIcon />
                Remover foto
              </Button>
            )}

            {draft && (
              <FormActions onCancel={() => setDraft(null)} busy={saving}>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  <CheckIcon />
                  {saving ? 'Salvando…' : 'Salvar foto'}
                </Button>
              </FormActions>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="profile-presets-title">Ou escolha um avatar do Blue Hawk</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '14px' }}>
          Selecione uma das ilustrações temáticas inspiradas no universo de jogos de tabuleiro:
        </p>
        <div className="profile-presets-grid">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isSelected}
                className={`profile-preset-card ${isSelected ? 'profile-preset-card--selected' : ''}`}
                onClick={() => {
                  setDraft({ kind: 'preset', presetId: preset.id, image: preset.dataUri })
                  setFeedback(null)
                }}
                aria-label={`Selecionar avatar ${preset.label}`}
              >
                <Avatar name={preset.label} size="md" photoUrl={preset.dataUri} />
                <span>{preset.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
