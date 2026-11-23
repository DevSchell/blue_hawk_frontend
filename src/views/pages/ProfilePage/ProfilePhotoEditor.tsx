import { useState, useRef, type ChangeEvent } from 'react'
import type { User } from '../../../models/services/accountService'
import { clearUserAvatar, getUserAvatar, saveUserAvatar } from '../../../models/session'
import { Alert } from '../../components/Alert/Alert'
import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { CheckIcon, TrashIcon, UploadIcon } from '../../components/Icons/Icons'
import { AVATAR_PRESETS } from './avatarPresets'
import { validatePhotoFile } from './profileUtils'

type ProfilePhotoEditorProps = {
  user: User
}

export function ProfilePhotoEditor({ user }: ProfilePhotoEditorProps) {
  const initialPhoto = getUserAvatar(user.id)
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhoto)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ tone: 'info' | 'warn'; message: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validatePhotoFile(file)
    if (!validation.valid) {
      setFeedback({ tone: 'warn', message: validation.error! })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setPhotoUrl(result)
      setSelectedPreset(null)
      setFeedback(null)
    }
    reader.onerror = () => {
      setFeedback({ tone: 'warn', message: 'Não foi possível ler a imagem selecionada.' })
    }
    reader.readAsDataURL(file)
  }

  function handleSelectPreset(presetId: string, dataUri: string) {
    setSelectedPreset(presetId)
    setPhotoUrl(dataUri)
    setFeedback(null)
  }

  function handleRemovePhoto() {
    setSaving(true)
    clearUserAvatar(user.id)
    setPhotoUrl(null)
    setSelectedPreset(null)
    setFeedback({ tone: 'info', message: 'Foto removida. Suas iniciais voltaram a ser exibidas.' })
    setSaving(false)
  }

  function handleSavePhoto() {
    setSaving(true)
    if (photoUrl) {
      saveUserAvatar(photoUrl, user.id)
      setFeedback({ tone: 'info', message: 'Foto de perfil salva com sucesso!' })
    } else {
      clearUserAvatar(user.id)
      setFeedback({ tone: 'info', message: 'Foto de perfil atualizada.' })
    }
    setSaving(false)
  }

  return (
    <section className="account__section profile-photo-editor" aria-labelledby="perfil-foto-title">
      <div>
        <h2 id="perfil-foto-title">Foto de Perfil</h2>
        <p>Personalize a sua imagem de exibição na comunidade Blue Hawk.</p>
      </div>

      {feedback && (
        <Alert
          tone={feedback.tone}
          size="sm"
          title={feedback.tone === 'warn' ? 'Atenção' : 'Pronto'}
        >
          {feedback.message}
        </Alert>
      )}

      <div className="profile-photo-preview">
        <Avatar name={user.name} size="xl" photoUrl={photoUrl} />
        <div className="profile-photo-preview__info">
          <h3>Pré-visualização</h3>
          <p>
            {photoUrl
              ? 'Esta imagem aparecerá na barra superior, no menu lateral e em suas partidas.'
              : 'Você está usando o avatar padrão com suas iniciais em açafrão.'}
          </p>
          <div className="profile-photo-actions" style={{ marginTop: '14px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              Carregar imagem
            </Button>

            {photoUrl && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleRemovePhoto}
                disabled={saving}
              >
                <TrashIcon />
                Remover foto
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSavePhoto}
              disabled={saving}
            >
              <CheckIcon />
              Salvar foto
            </Button>
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
            const isSelected = selectedPreset === preset.id || photoUrl === preset.dataUri
            return (
              <button
                key={preset.id}
                type="button"
                className={`profile-preset-card ${isSelected ? 'profile-preset-card--selected' : ''}`}
                onClick={() => handleSelectPreset(preset.id, preset.dataUri)}
                aria-label={`Selecionar preset ${preset.label}`}
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
