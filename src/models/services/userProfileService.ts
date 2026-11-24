import { readUserId, saveUserAvatar, clearUserAvatar, saveUserProfileExtras } from '../session'
import { levelLabel, type MyProfile, type MyProfileInput, type PublicProfile } from '../userProfile'
import { apiDeleteJson, apiGet, apiPostForm, apiPut, apiUrl } from './apiClient'
import { presetDataUri } from '../avatarPresets'

export function getMyProfile(signal?: AbortSignal) {
  return apiGet<MyProfile>('/users/me/profile', {}, signal)
}

export function updateMyProfile(input: MyProfileInput) {
  return apiPut<MyProfile>('/users/me/profile', input)
}

export function uploadAvatar(file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiPostForm<MyProfile>('/users/me/avatar', form)
}

/** Remove a foto enviada e o avatar escolhido (volta às iniciais) */
export function removeAvatar() {
  return apiDeleteJson<MyProfile>('/users/me/avatar')
}

export function getPublicProfile(userId: string, signal?: AbortSignal) {
  return apiGet<PublicProfile>(`/users/${encodeURIComponent(userId)}/public-profile`, {}, signal)
}

/** Imagem do avatar de um perfil: foto enviada, ilustração escolhida ou null (iniciais) */
export function avatarImageOf(profile: { avatarUrl: string | null; avatarPreset: string | null }): string | null {
  if (profile.avatarUrl) return apiUrl(profile.avatarUrl)
  return profile.avatarPreset ? presetDataUri(profile.avatarPreset) : null
}

/**
 * Guarda o perfil do próprio usuário no navegador: o topo, o menu e a ficha do perfil leem dali.
 * A fonte da verdade é a API; isto é só o cache (atualizado ao abrir o perfil, ao salvar e ao entrar).
 */
export function cacheMyProfile(profile: MyProfile) {
  const userId = readUserId()
  if (!userId) return
  saveUserProfileExtras(
    {
      bio: profile.bio ?? '',
      city: profile.city ?? '',
      favoriteGenres: profile.favoriteGenres ?? '',
      experienceLevel: levelLabel(profile.experienceLevel),
      isPublic: profile.isPublic,
      showShelf: profile.showShelf,
      matchAlerts: profile.matchAlerts,
      offerAlerts: profile.offerAlerts,
    },
    userId,
  )
  const image = avatarImageOf(profile)
  if (image) saveUserAvatar(image, userId)
  else clearUserAvatar(userId)
}
