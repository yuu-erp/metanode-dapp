import { abis } from '@/abis'
import { FileHandler } from '../new'
import { ContractClient } from './contract-client'
import { sendCommand } from '@metanodejs/system-core'

export const fileHandler = new FileHandler()
export const contractClient = new ContractClient()
contractClient.registerAbiMethods(abis)
contractClient.request = (v) => {
  const amountKey = window.fiaiSDK ? 'amount' : 'value'

  const payload = {
    from: v.from,
    to: v.to,
    feeType: v.feeType,
    functionName: v.abi.name,
    abiData: [v.abi],
    inputArray: v.inputArray,
    isCall: true,
    isDeploy: true,
    isReadOnly: v.feeType === 'read',
    gas: v.gas || 300_000,
    type: 'transaction',
    bundleId: '',
    [amountKey]: v.amount || 0
  }

  const command = window.fiaiSDK ? 'sendTransaction' : 'executeSmartContract'
  return sendCommand(command, payload)
}
export const methods = contractClient.methods as ContractMethods
