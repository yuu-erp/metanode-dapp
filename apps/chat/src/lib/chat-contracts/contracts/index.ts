// core/contracts.ts
import { AbiItem, ContractMethods, ContractsSchema } from './types'
import { ContractInstance, ContractTransport } from './core'

class Contracts {
  private transport = new ContractTransport()

  private instances: Record<string, ContractInstance> = {}

  /**
   * init once at app bootstrap
   */
  init<S extends ContractsSchema>(abis: Record<keyof S, AbiItem[]>) {
    Object.entries(abis).forEach(([key, abi]) => {
      if (this.instances[key]) {
        throw new Error(`Contract ${key} already exists`)
      }

      this.instances[key] = new ContractInstance(this.transport, abi)
    })
    Object.assign(this, this.instances)
  }

  /**
   * session-level identity
   */
  setFrom(from: string) {
    Object.values(this.instances).forEach((i) => {
      i.from = from
    })
  }

  /**
   * bind static contracts only
   */
  setTo(tos: Record<string, string>) {
    Object.entries(tos).forEach(([key, to]) => {
      const instance = this.instances[key]
      if (instance && to) {
        instance.to = to
      }
    })
  }

  /**
   * getter
   */
  get<T extends Record<string, any>>() {
    return this.instances as T
  }
}

export const contracts = new Contracts()
export type ContractsType<T extends ContractsSchema> = Contracts & {
  [K in keyof T]: ContractMethods<T[K]>
}
