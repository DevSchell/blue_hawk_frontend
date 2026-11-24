import { useEffect, useState } from 'react'

type State<T> = { key: number; data: T | null; error: unknown }

/** Carrega uma lista ao montar e sempre que reload() é chamado */
export function useAsyncList<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<State<T>>({ key: -1, data: null, error: null })

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ key: attempt, data, error: null })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ key: attempt, data: null, error })
      })
    return () => controller.abort()
    // load é recriada a cada render; o recarregamento é controlado por attempt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  const loading = state.key !== attempt
  return {
    data: state.data,
    // mantém a lista anterior na tela enquanto recarrega
    loading,
    error: loading ? null : state.error,
    reload: () => setAttempt((n) => n + 1),
  }
}
