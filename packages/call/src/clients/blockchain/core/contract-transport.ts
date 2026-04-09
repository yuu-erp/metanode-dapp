import { configs } from './config'
import type { AbiItem, CallInput, FeeType, SendSystemCore, TransactionInput } from './types'
import { coerceBooleanStrings, generateInputArray, parseIfJson } from './utils'

export class ContractTransport {
  private hash = ''

  constructor(private send: SendSystemCore) {}

  get isWeb() {
    return typeof window !== 'undefined' && (window as any).finSdk
  }

  get lastHash() {
    return this.hash
  }

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
    return null
  }

  private async sendByNative(payload: any) {
    const result = await this.send({
      command: 'executeSmartContract',
      value: payload
    })
    if (!result?.success) throw result
    return result.data
  }

  private async sendByWebSdk(payload: any) {
    const response = await (window as any).finSdk.sendTransaction(payload)
    if (!response?.success) throw response
    return response.data ?? response
  }

  private detectFeeType(abi: AbiItem): FeeType {
    switch (abi.stateMutability) {
      case 'view':
      case 'pure':
        return 'read'
      default:
        return 'sc'
    }
  }

  private decodeTransactionResponse(result: any) {
    const returnValue =
      result?.data?.returnValue?.[''] ??
      result?.data?.returnValue ??
      result?.data?.['return-value'] ??
      result?.data ??
      result?.returnValue
    const formatedResult = coerceBooleanStrings(parseIfJson(returnValue))

    return {
      data: formatedResult[''] ?? formatedResult,
      hash: result?.data?.hash
    }
  }

  async sendTransaction({ gas = 3000000, amount = 0, input = '', abi, ...rest }: TransactionInput) {
    gas = this.isWeb ? Number(gas) : String(gas)
    amount = String(amount)
    const feeType = this.detectFeeType(abi)

    const payload: any = {
      ...rest,
      gas,
      [this.isWeb ? 'amount' : 'value']: amount,
      bundleId: this.getBundleId(),
      isReadOnly: feeType === 'read',
      functionName: abi?.name,
      abiData: [abi],
      feeType
    }

    if (this.isWeb) {
      Object.assign(payload, {
        type: 'transaction',
        isCall: true,
        input
      })
    }

    try {
      const result = await (this.isWeb ? this.sendByWebSdk(payload) : this.sendByNative(payload))

      const { data, hash } = this.decodeTransactionResponse(result)
      if (hash) this.hash = hash
      return data
    } catch (error) {
      if (configs.isDev) {
        console.error('[sendTransaction] error: ', { payload, error })
      }
      throw error
    }
  }

  call({ inputData, ...rest }: CallInput) {
    const payload: TransactionInput = {
      ...rest,
      inputArray: generateInputArray(rest.abi, inputData)
    }

    return this.sendTransaction(payload)
  }
}
