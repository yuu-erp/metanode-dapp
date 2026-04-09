export type SendSystemCorePayload = { command: string; value?: any }

export type SendSystemCore = (payload: SendSystemCorePayload) => Promise<any>

export type AbiItem = {
  name: string
  stateMutability: string
  inputs?: any[]
  type?: string
  [key: string]: any
}

export type FeeType = 'read' | 'sc'

export type TransactionInput = {
  gas?: string | number
  amount?: string | number
  input?: string
  from: string
  to: string
  abi: AbiItem
  inputArray: any[]
}

export type CallInput = Omit<TransactionInput, 'inputArray'> & {
  inputData?: any
}
