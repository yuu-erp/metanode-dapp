import { type AbiItem } from '@metanodejs/mtn-contract'
import abi from './abis.json'

function getAbiItem(name: string): AbiItem {
  const item = abi.find((item) => item.name === name)
  if (!item) throw new Error(`ABI item ${name} not found`)
  return item as unknown as AbiItem
}

export const anhancedAgentManagementABI = {
  getAgentFromDomain: getAbiItem('getAgentFromDomain'),
  getMeosSCByAgentFromFactory: getAbiItem('getMeosSCByAgentFromFactory')
}
