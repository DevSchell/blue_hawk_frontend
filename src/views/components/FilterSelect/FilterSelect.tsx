import { useId, type ReactNode } from 'react'
import './FilterSelect.css'

type FilterSelectProps<T extends string> = {
  /** Prefixo visível (ex.: "Ordenar") */
  label: string
  /** Rótulo para o leitor de tela (ex.: "Ordenar jogos por") */
  ariaLabel: string
  icon?: ReactNode
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}

/** Select nativo com prefixo, no visual dos filtros (Estante, Loja) */
export function FilterSelect<T extends string>({
  label,
  ariaLabel,
  icon,
  value,
  options,
  onChange,
}: FilterSelectProps<T>) {
  const id = useId()
  return (
    <div className="filter-select">
      <label htmlFor={id} className="visually-hidden">
        {ariaLabel}
      </label>
      <span className="filter-select__prefix" aria-hidden="true">
        {icon}
        {label}:
      </span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
