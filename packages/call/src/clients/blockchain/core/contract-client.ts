import { ContractTransport } from './contract-transport'
import { CallInput } from './types'

export class ContractClient {
  from = ''
  to = ''

  constructor(
    private transport: ContractTransport,
    private abis: any[]
  ) {}

  make<I, O>(name: string, options: Partial<Omit<CallInput, 'inputData'>> = {}) {
    const abi = this.abis.find((item) => item.name === name)

    if (!abi) {
      throw new Error(`ABI not found: ${name}`)
    }

    return (inputData: I, to = '', from = '') => {
      return this.transport.call({
        from: from || this.from,
        to: to || this.to,
        abi,
        inputData,
        ...options
      }) as Promise<O>
    }
  }
}
