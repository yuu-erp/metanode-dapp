import type { FileMehods } from './file/file.methods'
import type { FileEvents } from './file/file.events'
import type { GroupMehods } from './group/group.methods'
import type { GroupEvents } from './group/group.events'
import type { UserMehods } from './user/user.methods'
import type { UserEvents } from './user/user.events'

export type HandlerDefinition<Input = unknown, Output = unknown> = [Input, Output]

export type RegistrySchema = Record<string, Record<string, HandlerDefinition<unknown, unknown>>>

export type RegistryHandlers<TSchema extends RegistrySchema, TOptions = unknown> = {
  [TGroup in keyof TSchema]: {
    [TKey in keyof TSchema[TGroup]]: (
      input: TSchema[TGroup][TKey][0],
      options?: TOptions
    ) => Promise<TSchema[TGroup][TKey][1]>
  }
}
export type ContractOptions = {
  from?: string
  to?: string
  gas?: string | number
  amount?: string
}

export type ContractMethods = RegistryHandlers<
  {
    file: FileMehods
    group: GroupMehods
    user: UserMehods
  },
  ContractOptions
>

export type ContractEvents = FileEvents & GroupEvents & UserEvents
