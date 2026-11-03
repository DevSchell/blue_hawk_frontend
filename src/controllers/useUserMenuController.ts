import { useState } from 'react'
import { useSession } from './useSession'
import { useTheme } from './useTheme'

/** Estado do menu lateral do usuário: sessão, tema e se a gaveta está aberta. */
export function useUserMenuController() {
  const session = useSession()
  const { theme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return {
    session,
    isDarkTheme: theme === 'dark',
    toggleTheme,
    isOpen,
    openMenu: () => setIsOpen(true),
    closeMenu: () => setIsOpen(false),
  }
}
