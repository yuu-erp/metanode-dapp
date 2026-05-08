import { AbiItem } from '../types'
import { ContractTransport } from './contract-transport'

export class ContractInstance {
  from = ''
  to = ''

  constructor(
    private transport: ContractTransport,
    public abis: AbiItem[]
  ) {
    abis.forEach(({ name }) => {
      if (!name) return
      ;(this as any)[name] = this.#make(name)
    })
  }

  #make<I, O>(name: string) {
    const abi = this.abis.find((item) => item.name === name)

    if (!abi) {
      throw new Error(`ABI not found: ${name}`)
    }

    return (inputData: I, to = '') => {
      return this.transport.call({
        from: this.from,
        to: to || this.to,
        abi,
        inputData
      }) as Promise<O>
    }
  }
}
