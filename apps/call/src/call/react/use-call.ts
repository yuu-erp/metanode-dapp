import { useContext } from 'react'
import { callContext } from './call-context-instance'

export function useCall() {
  const context = useContext(callContext)
  if (!context) throw new Error('useCall must use in call context')
  return context
}
