export {}
declare global {
  type HandlerDefinition<Input = unknown, Output = unknown> = [Input, Output]

  type RegistrySchema = Record<string, Record<string, HandlerDefinition<unknown, unknown>>>

  type RegistryHandlers<TSchema extends RegistrySchema, TOptions = unknown> = {
    [TGroup in keyof TSchema]: {
      [TKey in keyof TSchema[TGroup]]: (
        input: TSchema[TGroup][TKey][0],
        options?: TOptions
      ) => Promise<TSchema[TGroup][TKey][1]>
    }
  }
  type ContractMethods = RegistryHandlers<
    BCMethods,
    { amount?: string | number; from?: string; to?: string }
  >
}
