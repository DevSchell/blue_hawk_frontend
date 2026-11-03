import { useState } from 'react'
import { useTheme } from './useTheme'

type UserMenuActions = {
  onSignIn: () => void
  onSignOut: () => void
}

/** Estado do menu lateral do usuário: tema e se a gaveta está aberta. A sessão vem do app. */
export function useUserMenuController({ onSignIn, onSignOut }: UserMenuActions) {
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return {
    isDarkTheme: theme === 'dark',
    toggleTheme,
    isOpen,
    openMenu: () => setIsOpen(true),
    closeMenu: () => setIsOpen(false),
    /** Fecha a gaveta antes de abrir o login, para não empilhar dois modais */
    signIn: () => {
      setIsOpen(false)
      onSignIn()
    },
    signOut: () => {
      setIsOpen(false)
      onSignOut()
    },
  }
}
