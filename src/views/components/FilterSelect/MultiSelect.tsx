import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { cx } from '../../utils/classNames'
import { CheckIcon } from '../Icons/Icons'
import './FilterSelect.css'

type MultiSelectProps = {
  /** Prefixo do gatilho (ex.: "Categoria") */
  label: string
  icon?: ReactNode
  options: readonly string[]
  /** Quantos itens há em cada opção (opcional) */
  counts?: Record<string, number>
  selected: string[]
  onToggle: (option: string) => void
  onClear: () => void
  /** Texto quando nada está marcado */
  allLabel?: string
}

/** Filtro em dropdown com seleção múltipla, no visual dos filtros (.filter-select) */
export function MultiSelect({
  label,
  icon,
  options,
  counts,
  selected,
  onToggle,
  onClear,
  allLabel = 'Todas',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  // Fecha ao clicar fora ou com Esc
  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const summary =
    selected.length === 0 ? allLabel : selected.length === 1 ? selected[0] : `${selected.length} selecionadas`

  return (
    <div ref={rootRef} className="multi-select">
      <button
        type="button"
        className={cx('filter-select', 'multi-select__trigger', selected.length > 0 && 'is-filtered')}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="filter-select__prefix">
          {icon}
          {label}:
        </span>
        <span className="multi-select__value">{summary}</span>
        <svg className="filter-select__chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div id={panelId} className="multi-select__panel" role="group" aria-label={label}>
          <ul className="multi-select__list">
            {options.map((option) => {
              const checked = selected.includes(option)
              return (
                <li key={option}>
                  <label className={cx('multi-select__option', checked && 'is-checked')}>
                    <input type="checkbox" checked={checked} onChange={() => onToggle(option)} />
                    <span className="multi-select__box" aria-hidden="true">
                      {checked && <CheckIcon />}
                    </span>
                    <span className="multi-select__name">{option}</span>
                    {counts && <span className="multi-select__count">{counts[option] ?? 0}</span>}
                  </label>
                </li>
              )
            })}
          </ul>
          <button type="button" className="multi-select__clear" disabled={selected.length === 0} onClick={onClear}>
            Limpar seleção
          </button>
        </div>
      )}
    </div>
  )
}
