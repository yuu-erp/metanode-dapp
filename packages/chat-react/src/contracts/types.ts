import { ContractInstance } from './core/contract-instance'

export type SendSystemCorePayload = { command: string; value?: any }

export type SendSystemCore = (payload: SendSystemCorePayload) => Promise<any>

export type AbiItem = {
  name?: string
  stateMutability?: string
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

//
// ✅ MethodSchema dạng tuple
// [Input, Output]
//
export type MethodSchema = {
  [method: string]: [input: any, output: any]
}

//
// ✅ Contracts schema (multi contract)
//
export type ContractsSchema = {
  [contractName: string]: MethodSchema
}

//
// ✅ Map method → function
//
export type ContractMethods<S extends MethodSchema> = {
  [K in keyof S]: (input: S[K][0], to?: string) => Promise<S[K][1]>
}

//
// ✅ Map contracts → instances + methods
//
export type ContractsMethods<S extends ContractsSchema> = {
  [K in keyof S]: ContractInstance & ContractMethods<S[K]>
}
