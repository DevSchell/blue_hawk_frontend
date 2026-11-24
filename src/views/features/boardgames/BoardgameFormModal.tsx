import { useId, type ReactNode } from 'react'
import { useBoardgameFormController } from '../../../controllers/useBoardgameFormController'
import { BOARDGAME_DESCRIPTION_MAX, BOARDGAME_NAME_MAX, type Boardgame } from '../../../models/boardgame'
import { coverOf } from '../../../models/services/boardgameService'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { Modal } from '../../components/Modal/Modal'
import { TextField } from '../../components/TextField/TextField'
import { cx } from '../../utils/classNames'
import { COVER_PRESETS } from './coverPresets'
import { GameCover } from './GameCover'
import { FormActions } from '../../components/FormActions/FormActions'
import '../auth/AuthForm.css'
import './BoardgameFormModal.css'

type BoardgameFormModalProps = {
  /** Jogo a corrigir; sem ele, a modal cadastra um novo */
  game?: Boardgame | null
  /** Admin cadastra direto no catálogo; muda só o texto de apoio */
  isAdmin: boolean
  /** {@code warning}: o jogo foi salvo, mas a foto de capa não */
  onSaved: (saved: Boardgame, warning?: string) => void
  onClose: () => void
}

/** Cadastro (ou correção) de um jogo que o usuário possui */
export function BoardgameFormModal({ game = null, isAdmin, onSaved, onClose }: BoardgameFormModalProps) {
  const currentImageUrl = game ? coverOf(game).imageUrl : null
  const c = useBoardgameFormController(game, currentImageUrl, onSaved)
  const descriptionId = useId()
  const categoryId = useId()
  const fileId = useId()
  const coverLabelId = useId()
  // Nome provisório só para o texto alternativo das miniaturas
  const previewName = c.name.trim() || 'o jogo'

  const lead = c.isEditing
    ? game?.approvalStatus === 'REJECTED'
      ? 'Corrija os dados e o jogo volta para a fila de aprovação.'
      : 'Ajuste os dados enquanto o jogo aguarda aprovação.'
    : isAdmin
      ? 'Como admin, o jogo entra direto no catálogo da Wiki, já aprovado.'
      : 'Ele entra na sua estante na hora e aparece na Wiki depois que um admin aprovar.'

  return (
    <Modal open onClose={onClose} title={c.isEditing ? 'Editar jogo' : 'Cadastrar jogo'} lead={lead}>
      <form className="auth-form" onSubmit={c.submit} noValidate>
        {c.error && (
          <Alert tone="warn" size="sm" title="Não deu para salvar">
            {c.error}
          </Alert>
        )}

        <TextField
          label="Nome"
          placeholder="Ex.: Marés de Ferro"
          maxLength={BOARDGAME_NAME_MAX}
          value={c.name}
          onChange={c.setName}
          initialFocus
        />

        <div className="text-field">
          <label htmlFor={descriptionId}>Descrição</label>
          <div className="text-field__control">
            <textarea
              id={descriptionId}
              className="text-field__input boardgame-form__textarea"
              placeholder="Do que se trata o jogo, em uma ou duas frases"
              rows={3}
              maxLength={BOARDGAME_DESCRIPTION_MAX}
              value={c.description}
              onChange={(e) => c.setDescription(e.target.value)}
              aria-describedby={`${descriptionId}-hint`}
            />
          </div>
          <small id={`${descriptionId}-hint`} className="text-field__hint">
            {c.descriptionLeft} de {BOARDGAME_DESCRIPTION_MAX} caracteres restantes.
          </small>
        </div>

        <div className="text-field">
          <label htmlFor={categoryId}>Categoria</label>
          <div className="text-field__control">
            <select
              id={categoryId}
              className="text-field__input boardgame-form__select"
              value={c.categoryId}
              onChange={(e) => c.setCategoryId(e.target.value)}
              disabled={!c.categories}
            >
              <option value="" disabled>
                {c.categories ? 'Escolha a categoria' : c.categoriesFailed ? 'Não deu para carregar' : 'Carregando…'}
              </option>
              {c.categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="boardgame-form__numbers">
          <TextField
            label="Lançamento"
            type="number"
            inputMode="numeric"
            min={1}
            max={c.maxYear}
            placeholder="2024"
            hint="Ano"
            value={c.releaseYear}
            onChange={c.setReleaseYear}
          />
          <TextField
            label="Jogadores"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="4"
            hint="Máximo"
            value={c.playerNumber}
            onChange={c.setPlayerNumber}
          />
          <TextField
            label="Duração"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="60"
            hint="Minutos"
            value={c.playTime}
            onChange={c.setPlayTime}
          />
        </div>

        <fieldset className="boardgame-form__cover" aria-labelledby={coverLabelId}>
          <legend id={coverLabelId}>Capa</legend>
          <p className="boardgame-form__cover-hint">Escolha uma das artes do site ou envie uma foto do seu jogo.</p>

          <div className="boardgame-form__covers" role="radiogroup" aria-labelledby={coverLabelId}>
            {c.cover.kind === 'upload' && (
              <CoverOption checked label="Foto enviada" onSelect={() => undefined}>
                <img src={c.cover.previewUrl} alt={`Foto escolhida para ${previewName}`} />
              </CoverOption>
            )}
            {c.cover.kind !== 'upload' && currentImageUrl && (
              <CoverOption checked={c.cover.kind === 'current'} label="Foto atual" onSelect={c.chooseCurrent}>
                <img src={currentImageUrl} alt={`Foto atual de ${previewName}`} />
              </CoverOption>
            )}
            {COVER_PRESETS.map((preset) => (
              <CoverOption
                key={preset.key}
                checked={c.cover.kind === 'preset' && c.cover.key === preset.key}
                label={preset.label}
                onSelect={() => c.choosePreset(preset.key)}
              >
                <GameCover id={preset.key} name={previewName} preset={preset.key} />
              </CoverOption>
            ))}
          </div>

          {/* Input antes do rótulo: o foco do teclado no input destaca o rótulo (CSS com +) */}
          <input
            id={fileId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="visually-hidden"
            onChange={(e) => {
              void c.chooseFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <label htmlFor={fileId} className={cx('boardgame-form__upload', c.processingImage && 'is-busy')}>
            {c.processingImage ? 'Preparando a foto…' : c.cover.kind === 'upload' ? 'Trocar foto' : 'Enviar foto'}
          </label>
          <small className="text-field__hint">JPEG, PNG ou WebP. A foto é ajustada ao formato da capa.</small>
        </fieldset>

        <FormActions onCancel={onClose} busy={c.isSaving}>
          <Button type="submit" disabled={c.isSaving || c.processingImage}>
            {c.isSaving
              ? 'Salvando…'
              : c.isEditing
                ? game?.approvalStatus === 'REJECTED'
                  ? 'Salvar e reenviar'
                  : 'Salvar alterações'
                : isAdmin
                  ? 'Cadastrar no catálogo'
                  : 'Cadastrar e enviar para aprovação'}
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}

type CoverOptionProps = {
  checked: boolean
  label: string
  onSelect: () => void
  children: ReactNode
}

/** Miniatura de capa que funciona como uma opção de radio (clique, Enter ou Espaço escolhem) */
function CoverOption({ checked, label, onSelect, children }: CoverOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      title={label}
      className={cx('boardgame-form__cover-option', checked && 'is-checked')}
      onClick={onSelect}
    >
      {children}
    </button>
  )
}
