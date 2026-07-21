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

    return async (inputData: I, to = '', from = '') => {
      try {
        const rs = (await this.transport.call({
          from: from || this.from,
          to: to || this.to,
          abi,
          inputData,
          //@ts-ignore
          isFreeGas: true,
          ...options
        })) as Promise<O>
        if (name === 'createRoom') {
          console.log('thanhduy - createRoom rs', { rs })
        }
        return rs
      } catch (error) {
        console.error({
          error,
          abi
        })
        throw error
      }
    }
  }
}
