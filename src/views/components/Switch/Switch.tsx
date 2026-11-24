import './Switch.css'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** id do elemento com o texto do rótulo */
  labelledBy: string
  disabled?: boolean
}

export function Switch({ checked, onChange, labelledBy, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      className="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__thumb" />
    </button>
  )
}
