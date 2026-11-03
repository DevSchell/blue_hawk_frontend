import './Switch.css'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** id do elemento com o texto do rótulo */
  labelledBy: string
}

export function Switch({ checked, onChange, labelledBy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      className="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__thumb" />
    </button>
  )
}
