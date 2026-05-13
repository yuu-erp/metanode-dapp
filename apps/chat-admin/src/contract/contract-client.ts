import { sendCommand } from '@metanodejs/system-core'
import { jsonToInputArray } from './json-to-input-array'

export type BlockchainMethodOptions = {
  gas?: string | number
  amount?: string | number
  from?: string
  to?: string
}

export class ContractClient {
  constructor() {}
  readonly methods: Record<string, Record<string, Function>> = {}
  private froms: Record<string, string> = {}
  private tos: Record<string, string> = {}
  private bundleId = this.getBundleId()
  private env = this.getRuntimeEnv()

  private detectFeeType(abi: any): string {
    switch (abi.stateMutability) {
      case 'view':
        return 'read'
      case 'nonpayable':
        return 'sc'
      default:
        throw new Error(`Unsupported ABI type: ${abi.type}`)
    }
  }

  private sendTransaction(input: any) {
    console.log('sendTransaction - input', input)
    const { gas = 3000000, amount = 0, abi, from, to, payload } = input
    const feeType = this.detectFeeType(abi)
    const inputArray = jsonToInputArray(abi, payload)
    const isWeb = (this.env = 'web')

    const sendTransactionParams = {
      abiData: [abi],
      functionName: abi.name,
      bundleId: this.bundleId,
      isReadOnly: feeType === 'read',
      feeType,
      isCall: true,
      type: 'transaction',
      gas: isWeb ? Number(gas) : String(gas),
      [isWeb ? 'amount' : 'value']: String(amount),
      inputArray,
      from,
      to
    }

    if (isWeb) {
      Object.assign(payload, {
        type: 'transaction',
        isCall: true
      })
    }

    console.log('sendTransactionParams', sendTransactionParams)

    return this.handleSendTransaction(sendTransactionParams)
  }

  registerAbiMethods(input: Record<string, any[]>) {
    Object.entries(input).forEach(([key, abiArray]) => {
      const validAbis = abiArray.filter((abi) => abi.type === 'function')
      validAbis.forEach((abi) => {
        if (!abi.name) return
        ;(this.methods as any)[key] ??= {}
        ;(this.methods as any)[key][abi.name] = async (
          payload: any = {},
          options: BlockchainMethodOptions = {}
        ) => {
          const { from, to, ...rest } = options ?? {}
          const rs = await this.sendTransaction({
            ...rest,
            abi,
            from: from || this.froms[key] || '',
            to: to || this.tos[key] || '',
            payload
          })
          return rs?.[''] ?? rs
        }
      })
    })
  }

  setFrom(from: string) {
    Object.keys(this.methods).forEach((key) => {
      this.froms[key] = from
    })
  }

  setTos(tos: Record<string, string>) {
    Object.keys(this.methods).forEach((key) => {
      this.tos[key] = tos[key] ?? ''
    })
  }

  //utils
  private getBundleId() {
    const searchParams = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    // Ưu tiên: Nếu windowId có trong window.location.search
    if (searchParams.has('bundleId')) {
      return searchParams.get('bundleId')
    }
    // Nếu không có, kiểm tra phần hash (nếu có chứa query string)
    if (hash.includes('?')) {
      const hashQuery = hash.split('?')[1]
      const hashParams = new URLSearchParams(hashQuery)
      if (hashParams.has('bundleId')) {
        return hashParams.get('bundleId')
      }
    }
    // Nếu không tìm thấy
    return ''
  }

  private getRuntimeEnv(): string {
    if (!!window.webkit?.messageHandlers?.callbackHandler?.postMessage) return 'webkit'
    if (!!window?.electronAPI?.sendMessage) return 'electron'
    return 'web'
  }

  private async handleSendTransaction(payload: any) {
    let rs: any

    if (this.env === 'web') {
      rs = await window.finSdk?.sendTransaction(payload)
    } else {
      rs = await sendCommand('executeSmartContract', payload)
    }

    if (!rs?.success) {
      console.error('Send transaction [error]', {
        rs,
        payload
      })
      throw new Error('Send transaction failed')
    }
    const data = rs?.data ?? {}
    const response = data.returnValue ?? data['return-value'] ?? {}
    return response?.[''] ?? response
  }
}
