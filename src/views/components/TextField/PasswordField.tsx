import { useState, type ComponentProps } from 'react'
import { IconButton } from '../IconButton/IconButton'
import { EyeIcon, EyeOffIcon } from '../Icons/Icons'
import { TextField } from './TextField'

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'trailing'>

/** TextField de senha com botão para mostrar ou esconder o que foi digitado */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <IconButton
          variant="ghost"
          label={visible ? 'Esconder senha' : 'Mostrar senha'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </IconButton>
      }
    />
  )
}
