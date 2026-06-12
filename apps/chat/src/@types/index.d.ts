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

  interface Window {
    finSdk?: any
    fiaiSDK?: any
  }

  type BaseConversation = {
    id: string
    type: string
  }

  type UserStatus = {
    status: string
    [key: string]: any
  }

  type ReactionItemData = {
    reaction: string
    reactor: string[]
  }

  type BaseMessage = {
    content?: any
    sender: string
    id: string
    timestamp: string
    isRead?: boolean
    reactions: ReactionItemData[]
    isMine?: boolean
  }

  type FulleMessage = Omit<BaseMessage, 'content'> & {
    content?: string
    type: string
    isFailed?: boolean
    isEdited?: boolean
    status?: string
    fileId?: string
    stickerId?: string
    duration?: number
    replyTo?: string
    forwardFrom?: string
    forwardFromType?: string
  }
}
