export type HandlerDefinition<Input = unknown, Output = unknown> = [Input, Output]
export type RegistrySchema = Record<string, Record<string, HandlerDefinition<any, any>>>
export type RegistryHandlers<TSchema extends RegistrySchema, TOptions = any> = {
  [TGroup in keyof TSchema]: {
    [TKey in keyof TSchema[TGroup]]: (
      input: TSchema[TGroup][TKey][0],
      options?: TOptions
    ) => Promise<TSchema[TGroup][TKey][1]>
  }
}

export type WithExecutor = {
  _executor: string
}

export type WithPagination = {
  page: number
  pageSize: number
}

export type WithPaginationResult<T> = T & {
  total: number
  totalPages: number
}

export type WithUser = {
  user: string
}

export type EventMap = {
  AdminExecutorAppointed: {
    executor: string
    appointedBy: string
  }
  AdminExecutorRevoked: {
    executor: string
    revokedBy: string
  }
}
