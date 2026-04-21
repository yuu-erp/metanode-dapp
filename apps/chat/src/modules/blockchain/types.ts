export interface TransactionPayload<T = unknown> {
  from: string
  to?: string
  inputData?: T
}
