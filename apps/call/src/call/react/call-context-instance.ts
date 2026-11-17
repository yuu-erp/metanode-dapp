import { createContext } from 'react'

export type CallContext = Record<string, never>

export const callContext = createContext<CallContext>(null!)
