import { useState } from 'react'
import { readSession } from '../models/session'

export function useSession() {
  const [session] = useState(readSession)
  return session
}
