import { ApiError } from '../../../models/services/apiClient'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'

function describe(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return {
        title: 'Feed fechado',
        text: 'A API ainda não liberou a lista de jogos para visitantes.',
      }
    }
    if (error.status >= 500) {
      return { title: 'Servidor fora do ar', text: 'A API respondeu com erro. Tente de novo em instantes.' }
    }
    return { title: 'Algo deu errado', text: `A API respondeu com o código ${error.status}.` }
  }
  return { title: 'Sem conexão', text: 'Não foi possível falar com o servidor. Confira sua internet.' }
}

export function FeedError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const { title, text } = describe(error)

  return (
    <Alert
      tone="warn"
      title={title}
      action={
        <Button variant="secondary" onClick={onRetry}>
          Tentar de novo
        </Button>
      }
    >
      {text}
    </Alert>
  )
}
