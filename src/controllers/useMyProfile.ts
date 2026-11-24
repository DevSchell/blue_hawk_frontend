import { useCallback, useEffect, useState } from 'react'
import {
  cacheMyProfile,
  getMyProfile,
  removeAvatar,
  updateMyProfile,
  uploadAvatar,
} from '../models/services/userProfileService'
import type { MyProfile, MyProfileInput } from '../models/userProfile'

/**
 * Perfil do próprio usuário na API (bio, cidade, nível, preferências e avatar).
 * Cada leitura/gravação também atualiza o cache do navegador, que o topo e a ficha do perfil usam.
 */
export function useMyProfile() {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getMyProfile(controller.signal)
      .then((data) => {
        setProfile(data)
        setError(null)
        cacheMyProfile(data)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err)
      })
    return () => controller.abort()
  }, [attempt])

  const apply = useCallback((data: MyProfile) => {
    setProfile(data)
    cacheMyProfile(data)
    return data
  }, [])

  /** Grava só os campos informados, mantendo o resto como está */
  const save = useCallback(
    async (changes: Partial<MyProfileInput>) => {
      if (!profile) throw new Error('Perfil ainda não carregado')
      const { avatarUrl: _ignored, ...current } = profile
      void _ignored
      return apply(await updateMyProfile({ ...current, ...changes }))
    },
    [profile, apply],
  )

  return {
    profile,
    error,
    loading: !profile && !error,
    reload: () => setAttempt((n) => n + 1),
    save,
    uploadPhoto: async (file: File) => apply(await uploadAvatar(file)),
    removePhoto: async () => apply(await removeAvatar()),
  }
}

export type MyProfileController = ReturnType<typeof useMyProfile>

/** Ao entrar (ou trocar de conta), traz o perfil da API para o cache: o avatar do topo segue a conta, não o aparelho */
export function useProfileCacheSync(signedInAs: string | null) {
  useEffect(() => {
    if (!signedInAs) return
    const controller = new AbortController()
    getMyProfile(controller.signal)
      .then(cacheMyProfile)
      .catch(() => undefined)
    return () => controller.abort()
  }, [signedInAs])
}
