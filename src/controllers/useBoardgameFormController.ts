import { useEffect, useState, type FormEvent } from 'react'
import {
  BOARDGAME_DESCRIPTION_MAX,
  BOARDGAME_NAME_MAX,
  COVER_IMAGE_MAX_BYTES,
  type Boardgame,
  type BoardgameInput,
  type Category,
} from '../models/boardgame'
import { ApiError } from '../models/services/apiClient'
import {
  createBoardgame,
  listCategories,
  removeBoardgameCover,
  updateBoardgame,
  uploadBoardgameCover,
} from '../models/services/boardgameService'

const MAX_YEAR = new Date().getFullYear() + 1
/** A foto é reduzida para no máximo este tamanho (proporção da capa: 300x170) antes de enviar */
const COVER_MAX_WIDTH = 1200
const COVER_MAX_HEIGHT = 680

/**
 * Capa escolhida no formulário:
 * - preset: uma das artes do site;
 * - upload: foto escolhida agora (já reduzida), com a prévia;
 * - current: a foto que o jogo já tem (na edição).
 */
export type CoverChoice =
  | { kind: 'preset'; key: string }
  | { kind: 'upload'; image: Blob; previewUrl: string }
  | { kind: 'current'; imageUrl: string }

/** Converte o texto de um campo numérico; vazio ou inválido vira NaN */
function toInt(value: string) {
  return value.trim() === '' ? Number.NaN : Number(value)
}

function validate(input: BoardgameInput) {
  if (!input.name) return 'Informe o nome do jogo.'
  if (input.name.length > BOARDGAME_NAME_MAX) return `O nome pode ter até ${BOARDGAME_NAME_MAX} caracteres.`
  if (!input.description) return 'Escreva uma descrição curta do jogo.'
  if (input.description.length > BOARDGAME_DESCRIPTION_MAX) {
    return `A descrição pode ter até ${BOARDGAME_DESCRIPTION_MAX} caracteres.`
  }
  if (!input.categoryId) return 'Escolha a categoria do jogo.'
  if (!Number.isInteger(input.releaseYear) || input.releaseYear < 1 || input.releaseYear > MAX_YEAR) {
    return `Informe o ano de lançamento (até ${MAX_YEAR}).`
  }
  if (!Number.isInteger(input.playerNumber) || input.playerNumber < 1) {
    return 'Informe o número máximo de jogadores (1 ou mais).'
  }
  if (!Number.isInteger(input.playTime) || input.playTime < 1) return 'Informe a duração média em minutos.'
  return null
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return 'A API recusou os dados. Confira os campos e tente de novo.'
    if (error.status === 401) return 'Sua sessão expirou. Entre de novo para continuar.'
    if (error.status === 403) return 'Você não pode editar este jogo: ele já faz parte do catálogo.'
    if (error.status === 404) return 'Este jogo não foi encontrado.'
    return `O servidor respondeu com erro (${error.status}). Tente de novo.`
  }
  return 'Não foi possível conectar ao servidor.'
}

/** Reduz a foto no navegador (canvas) e devolve um JPEG; recusa o que não for imagem */
async function prepareCoverImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    throw new Error('Escolha uma imagem JPEG, PNG ou WebP.')
  }
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('Não deu para ler essa imagem. Tente outra.')
  })
  const scale = Math.min(1, COVER_MAX_WIDTH / bitmap.width, COVER_MAX_HEIGHT / bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Não deu para processar essa imagem. Tente outra.')
  if (blob.size > COVER_IMAGE_MAX_BYTES) throw new Error('A imagem ficou maior que 2 MB. Tente outra.')
  return blob
}

function initialCover(game: Boardgame | null, imageUrl: string | null): CoverChoice {
  if (game && imageUrl) return { kind: 'current', imageUrl }
  return { kind: 'preset', key: game?.coverPreset ?? 'waves-1' }
}

/**
 * Formulário de jogo. Sem {@code game}: cadastra um novo (POST /boardgames).
 * Com {@code game}: edita os dados dele (PUT /boardgames/{id}); corrigir um recusado o reenvia para aprovação.
 * A foto de capa vai depois, num segundo envio (POST /boardgames/{id}/cover).
 * {@code onSaved} recebe um aviso quando o jogo foi salvo mas a foto não.
 */
export function useBoardgameFormController(
  game: Boardgame | null,
  currentImageUrl: string | null,
  onSaved: (saved: Boardgame, warning?: string) => void,
) {
  const [name, setName] = useState(game?.name ?? '')
  const [description, setDescription] = useState(game?.description ?? '')
  const [categoryId, setCategoryId] = useState(game?.categoryId ?? '')
  const [releaseYear, setReleaseYear] = useState(game?.releaseYear ? String(game.releaseYear) : '')
  const [playerNumber, setPlayerNumber] = useState(game?.playerNumber ? String(game.playerNumber) : '')
  const [playTime, setPlayTime] = useState(game?.playTime ? String(game.playTime) : '')
  const [cover, setCover] = useState<CoverChoice>(() => initialCover(game, currentImageUrl))
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [categoriesFailed, setCategoriesFailed] = useState(false)
  const [processingImage, setProcessingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    listCategories(controller.signal)
      .then(setCategories)
      .catch(() => {
        if (!controller.signal.aborted) setCategoriesFailed(true)
      })
    return () => controller.abort()
  }, [])

  // Libera a prévia local da foto quando ela é trocada ou a modal fecha
  const previewUrl = cover.kind === 'upload' ? cover.previewUrl : null
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const chooseFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setProcessingImage(true)
    try {
      const image = await prepareCoverImage(file)
      setCover({ kind: 'upload', image, previewUrl: URL.createObjectURL(image) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não deu para usar essa imagem.')
    } finally {
      setProcessingImage(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSaving || processingImage) return
    setError('')

    const input: BoardgameInput = {
      name: name.trim(),
      description: description.trim(),
      releaseYear: toInt(releaseYear),
      playerNumber: toInt(playerNumber),
      playTime: toInt(playTime),
      categoryId,
      coverPreset: cover.kind === 'preset' ? cover.key : null,
    }
    const invalid = validate(input)
    if (invalid) {
      setError(invalid)
      return
    }

    setIsSaving(true)
    let saved: Boardgame
    try {
      saved = game ? await updateBoardgame(game.id, input) : await createBoardgame(input)
    } catch (err) {
      setError(errorMessage(err))
      setIsSaving(false)
      return
    }

    // Segundo passo: a foto. O jogo já está salvo, então uma falha aqui vira só um aviso.
    try {
      if (cover.kind === 'upload') {
        const withImage = await uploadBoardgameCover(saved.id, cover.image)
        saved = { ...withImage, userBoardgameId: saved.userBoardgameId }
      } else if (cover.kind === 'preset' && currentImageUrl) {
        const withoutImage = await removeBoardgameCover(saved.id)
        saved = { ...withoutImage, userBoardgameId: saved.userBoardgameId }
      }
      onSaved(saved)
    } catch {
      onSaved(saved, 'O jogo foi salvo, mas a capa não. Tente trocar a capa de novo pela edição.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isEditing: Boolean(game),
    name,
    setName,
    description,
    setDescription,
    descriptionLeft: BOARDGAME_DESCRIPTION_MAX - description.length,
    categoryId,
    setCategoryId,
    categories,
    categoriesFailed,
    releaseYear,
    setReleaseYear,
    playerNumber,
    setPlayerNumber,
    playTime,
    setPlayTime,
    maxYear: MAX_YEAR,
    cover,
    choosePreset: (key: string) => setCover({ kind: 'preset', key }),
    /** Mantém a foto que o jogo já tem (na edição) */
    chooseCurrent: () => {
      if (currentImageUrl) setCover({ kind: 'current', imageUrl: currentImageUrl })
    },
    chooseFile,
    processingImage,
    isSaving,
    error,
    submit,
  }
}
