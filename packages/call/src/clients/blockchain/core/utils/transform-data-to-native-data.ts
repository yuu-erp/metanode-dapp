import type { AbiItem } from '../types'

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

export function generateInputArray(abi: AbiItem, data: any) {
  return buildAbiData(abi?.inputs ?? [], data)
}
