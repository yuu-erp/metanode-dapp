export interface TransactionPayload<T = unknown> {
  from: string
  inputData?: T
}
