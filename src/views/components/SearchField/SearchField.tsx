import './SearchField.css'

type SearchFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/** Campo de busca com rótulo visível, dentro de um form role="search" */
export function SearchField({ id, label, value, onChange, placeholder }: SearchFieldProps) {
  return (
    <form className="search-field" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </form>
  )
}
