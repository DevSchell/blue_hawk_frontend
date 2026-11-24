import { useState } from 'react'
import type { MyProfileController } from '../../../controllers/useMyProfile'
import type { MyProfileInput } from '../../../models/userProfile'
import { Alert } from '../../components/Alert/Alert'
import { Switch } from '../../components/Switch/Switch'

type PreferenceKey = 'isPublic' | 'showShelf' | 'matchAlerts' | 'offerAlerts'

const PREFERENCES: { key: PreferenceKey; id: string; title: string; text: string }[] = [
  {
    key: 'isPublic',
    id: 'pref-publico',
    title: 'Perfil visível para a comunidade',
    text: 'Outros jogadores veem sua bio, cidade, nível e números ao abrir seu perfil. Desligado, só aparecem seu nome e sua foto.',
  },
  {
    key: 'showShelf',
    id: 'pref-estante',
    title: 'Mostrar minha estante no perfil',
    text: 'Quem abrir seu perfil vê os jogos da sua coleção e quais estão à venda.',
  },
  {
    key: 'matchAlerts',
    id: 'pref-partidas',
    title: 'Alertas de novas partidas na sua região',
    text: 'Avisar quando novas mesas forem abertas por jogadores próximos de você.',
  },
  {
    key: 'offerAlerts',
    id: 'pref-ofertas',
    title: 'Alertas de ofertas em jogos desejados',
    text: 'Receba notificações quando jogos que você busca forem anunciados na loja.',
  },
]

/** Preferências salvas na conta: privacidade do perfil público e alertas */
export function ProfilePreferences({ myProfile }: { myProfile: MyProfileController }) {
  const [status, setStatus] = useState<'saved' | 'error' | null>(null)
  const [busy, setBusy] = useState<PreferenceKey | null>(null)
  const profile = myProfile.profile

  if (!profile) return null

  async function toggle(key: PreferenceKey, value: boolean) {
    setBusy(key)
    setStatus(null)
    try {
      await myProfile.save({ [key]: value } as Partial<MyProfileInput>)
      setStatus('saved')
    } catch {
      setStatus('error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="account__section" aria-labelledby="perfil-pref-title">
      <div>
        <h2 id="perfil-pref-title">Preferências do Jogador</h2>
        <p>Ajuste sua privacidade, notificações e o que a comunidade vê no seu perfil.</p>
      </div>

      <div aria-live="polite">
        {status === 'saved' && (
          <Alert size="sm" title="Pronto">
            Preferência salva na sua conta.
          </Alert>
        )}
        {status === 'error' && (
          <Alert size="sm" tone="warn" title="Não deu para salvar">
            Verifique a conexão e tente de novo.
          </Alert>
        )}
      </div>

      {PREFERENCES.map((pref) => {
        // A estante só aparece num perfil visível
        const disabled = busy !== null || (pref.key === 'showShelf' && !profile.isPublic)
        return (
          <div key={pref.key} className="account__row">
            <div>
              <span id={pref.id} className="profile-pref__title">
                {pref.title}
              </span>
              <small className="profile-pref__text">
                {pref.key === 'showShelf' && !profile.isPublic
                  ? 'Seu perfil está privado: ninguém vê a sua estante.'
                  : pref.text}
              </small>
            </div>
            <Switch
              checked={profile[pref.key]}
              onChange={(value) => void toggle(pref.key, value)}
              labelledBy={pref.id}
              disabled={disabled}
            />
          </div>
        )
      })}
    </section>
  )
}
