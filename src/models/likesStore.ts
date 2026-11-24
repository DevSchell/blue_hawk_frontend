/**
 * Estado das curtidas compartilhado entre card, modal e ranking: curtir em um lugar atualiza todos.
 * Guarda só o que mudou nesta sessão; o resto vem das respostas da API (likeCount/likedByMe).
 */
export type LikeState = { likeCount: number; likedByMe: boolean }

const overrides = new Map<string, LikeState>()
const listeners = new Set<() => void>()
/** Muda a cada curtida: o ranking usa para se atualizar */
let version = 0

export const likesStore = {
  get(id: string): LikeState | undefined {
    return overrides.get(id)
  },
  set(id: string, state: LikeState) {
    overrides.set(id, state)
    version += 1
    listeners.forEach((listener) => listener())
  },
  /** Ao sair da conta, as marcações de "curtido" deixam de valer */
  clear() {
    overrides.clear()
    version += 1
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  version: () => version,
}
