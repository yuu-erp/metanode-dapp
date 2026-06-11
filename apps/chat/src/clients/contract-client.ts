export type TransactionPayload = {
  from: string
  to: string
  inputArray: any[]
  feeType: string
  abi: any
  amount?: number | string
  gas?: number | string
}

export interface AbiIO {
  indexed?: boolean
  internalType?: string
  name?: string
  type: string
  components?: AbiIO[]
  [key: string]: any
}

export interface AbiItem {
  inputs: AbiIO[]
  type: string
  name?: string
  outputs?: AbiIO[]
  stateMutability?: string
  anonymous?: boolean
  indexed?: boolean
  internalType?: string
  [key: string]: any
}

function processTupleValue(value: any, components: any[] | undefined, depth: number): any {
  if (depth === 0) {
    return components ? buildAbiData(components, value) : value
  }

  if (!Array.isArray(value)) {
    return value
  }

  return value.map((item: any) => processTupleValue(item, components, depth - 1))
}

function buildAbiData(inputs: any[], data: Record<string, any>): any[] {
  return inputs.map((input) => {
    const value = data[input.name]

    if (input.type.startsWith('tuple')) {
      const arrayDepth = (input.type.match(/\[\]/g) || []).length

      return {
        ...input,
        value: processTupleValue(value, input.components, arrayDepth)
      }
    } else {
      let processedValue = value
      if (input.internalType === 'bool' && typeof value === 'boolean') {
        processedValue = value.toString()
      }

      return {
        ...input,
        value: processedValue
      }
    }
  })
}

export function jsonToInputArray(abi: AbiItem, data: any = {}) {
  return buildAbiData(abi?.inputs ?? [], data)
}

export function detectFeeType(abi: AbiItem) {
  switch (abi.stateMutability) {
    case 'view':
      return 'read'
    case 'payable':
    case 'nonpayable':
      return 'sc'
    default:
      throw new Error(`Unsupported ABI type: ${abi.type}`)
  }
}

export class ContractClient {
  constructor() {}
  readonly methods: Record<string, Record<string, Function>> = {}
  private froms: Record<string, string> = {}
  private tos: Record<string, string> = {}

  request: (payload: TransactionPayload) => Promise<any> = () => {
    throw new Error('request not set in contract client')
  }

  registerAbiMethods(input: AbiItem[] | Record<string, AbiItem[]>) {
    const array = (Array.isArray(input) ? [['', input]] : Object.entries(input)) as [
      string,
      AbiItem[]
    ][]
    array.forEach(([key, abiArray]) => {
      const validAbis = abiArray.filter((abi) => abi.type === 'function')
      validAbis.forEach((abi) => {
        if (!abi.name) return
        this.methods[key] ??= {}
        this.methods[key][abi.name] = async (
          data: any = {},
          options: Partial<TransactionPayload> = {}
        ) => {
          console.log('options', {
            options,
            f: this.froms,
            t: this.tos,
            t2: structuredClone(this.tos)
          })
          const payload: TransactionPayload = {
            from: this.froms[key],
            to: this.tos[key],
            ...options,
            abi,
            feeType: detectFeeType(abi),
            inputArray: jsonToInputArray(abi, data)
          }
          let rs = await this.request(payload)
          rs = rs?.returnValue ?? rs
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
    Object.assign(this.tos, tos)
  }
}
