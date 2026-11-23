import { useState } from 'react'
import type { User } from '../../../models/services/accountService'
import { getUserProfileExtras, saveUserProfileExtras } from '../../../models/session'
import { Alert } from '../../components/Alert/Alert'
import { Switch } from '../../components/Switch/Switch'

type ProfilePreferencesProps = {
  user: User
}

export function ProfilePreferences({ user }: ProfilePreferencesProps) {
  const initial = getUserProfileExtras(user.id)
  const [isPublic, setIsPublic] = useState(initial.isPublic ?? true)
  const [showShelf, setShowShelf] = useState(initial.showShelf ?? true)
  const [matchAlerts, setMatchAlerts] = useState(initial.matchAlerts ?? true)
  const [offerAlerts, setOfferAlerts] = useState(initial.offerAlerts ?? false)
  const [saved, setSaved] = useState(false)

  function updatePreference(key: string, value: boolean) {
    setSaved(false)
    const updated = {
      isPublic: key === 'isPublic' ? value : isPublic,
      showShelf: key === 'showShelf' ? value : showShelf,
      matchAlerts: key === 'matchAlerts' ? value : matchAlerts,
      offerAlerts: key === 'offerAlerts' ? value : offerAlerts,
    }

    if (key === 'isPublic') setIsPublic(value)
    if (key === 'showShelf') setShowShelf(value)
    if (key === 'matchAlerts') setMatchAlerts(value)
    if (key === 'offerAlerts') setOfferAlerts(value)

    saveUserProfileExtras(updated, user.id)
    setSaved(true)
  }

  return (
    <section className="account__section" aria-labelledby="perfil-pref-title">
      <div>
        <h2 id="perfil-pref-title">Preferências do Jogador</h2>
        <p>Ajuste sua privacidade, notificações e visibilidade para a comunidade.</p>
      </div>

      {saved && (
        <Alert size="sm" title="Pronto">
          Preferências salvas automaticamente.
        </Alert>
      )}

      <div className="account__row">
        <div>
          <span id="pref-publico" style={{ fontWeight: 700, display: 'block' }}>
            Perfil visível para a comunidade
          </span>
          <small style={{ color: 'var(--text-muted)' }}>
            Permite que outros jogadores encontrem seu perfil e vejam suas mesas de jogo.
          </small>
        </div>
        <Switch
          checked={isPublic}
          onChange={(val) => updatePreference('isPublic', val)}
          labelledBy="pref-publico"
        />
      </div>

      <div className="account__row">
        <div>
          <span id="pref-estante" style={{ fontWeight: 700, display: 'block' }}>
            Exibir estante nas buscas do mercado
          </span>
          <small style={{ color: 'var(--text-muted)' }}>
            Outros colecionadores podem ver quais jogos você possui para propostas de troca.
          </small>
        </div>
        <Switch
          checked={showShelf}
          onChange={(val) => updatePreference('showShelf', val)}
          labelledBy="pref-estante"
        />
      </div>

      <div className="account__row">
        <div>
          <span id="pref-partidas" style={{ fontWeight: 700, display: 'block' }}>
            Alertas de novas partidas na sua região
          </span>
          <small style={{ color: 'var(--text-muted)' }}>
            Avisar quando novas mesas forem abertas por jogadores próximos de você.
          </small>
        </div>
        <Switch
          checked={matchAlerts}
          onChange={(val) => updatePreference('matchAlerts', val)}
          labelledBy="pref-partidas"
        />
      </div>

      <div className="account__row">
        <div>
          <span id="pref-ofertas" style={{ fontWeight: 700, display: 'block' }}>
            Alertas de ofertas em jogos desejados
          </span>
          <small style={{ color: 'var(--text-muted)' }}>
            Receba notificações quando jogos que você busca forem anunciados na loja.
          </small>
        </div>
        <Switch
          checked={offerAlerts}
          onChange={(val) => updatePreference('offerAlerts', val)}
          labelledBy="pref-ofertas"
        />
      </div>
    </section>
  )
}
