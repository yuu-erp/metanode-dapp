import { abis } from '@/abis'
import { sendCommand } from '@metanodejs/system-core'
import { ContractClient } from './contract-client'

export const contractClient = new ContractClient()
contractClient.registerAbiMethods(abis)
contractClient.request = (v) => {
  try {
    const amountKey = window.fiaiSDK ? 'value' : 'value'
    const amount = v.amount || 0
    const payload = {
      from: v.from,
      to: v.to,
      feeType: v.feeType,
      functionName: v.abi.name,
      abiData: [v.abi],
      inputArray: v.inputArray,

      gas: String(v.gas || 300_000),
      type: 'transaction',
      bundleId: '',
      [amountKey]: window.fiaiSDK ? +amount : String(amount)
    }

    if (window.fiaiSDK) {
      Object.assign(payload, {
        isCall: true,
        isDeploy: true,
        isReadOnly: v.feeType === 'read'
      })
    }

    const command = window.fiaiSDK ? 'sendTransaction' : 'executeSmartContract'
    console.log('thahhduy send smc', {
      command,
      payload
    })
    return sendCommand(command, payload)
  } catch (error) {
    console.error('send contract error', error)
    throw error
  }
}
export const methods = contractClient.methods as ContractMethods
