import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './TextField.css'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (value: string) => void
  /** Ajuda abaixo do campo (ex.: "Mínimo de 8 caracteres") */
  hint?: string
  /** Campo focado quando a modal (ou o formulário) abre */
  initialFocus?: boolean
  /** Elemento dentro do campo, à direita (ex.: botão de mostrar senha) */
  trailing?: ReactNode
}

/** Campo de formulário com rótulo visível, no estilo do campo de busca */
export function TextField({ label, value, onChange, hint, initialFocus, trailing, id, ...inputProps }: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`

  return (
    <div className="text-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="text-field__control">
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint ? hintId : undefined}
          data-autofocus={initialFocus || undefined}
          className={trailing ? 'text-field__input text-field__input--trailing' : 'text-field__input'}
          {...inputProps}
        />
        {trailing && <div className="text-field__trailing">{trailing}</div>}
      </div>
      {hint && (
        <small id={hintId} className="text-field__hint">
          {hint}
        </small>
      )}
    </div>
  )
}
