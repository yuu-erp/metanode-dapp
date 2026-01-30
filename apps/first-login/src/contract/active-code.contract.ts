import { MtnContract } from '@metanodejs/mtn-contract'
import { activeCodeAbi } from './abi'
export class ActiveCodeContract extends MtnContract {
  constructor() {
    super({ to: '' })
  }

  getActiveCodeInfo(from: string, to: string, _activeCode: string) {
    return this.sendTransaction({
      from,
      to,
      functionName: 'getActiveCodeInfo',
      abiData: activeCodeAbi.getActiveCodeInfo,
      feeType: 'read',
      inputData: {
        _activeCode
      }
    })
  }

  getActiveCodesByDeviceInfo(
    from: string,
    to: string,
    inputData: {
      _IP: string
      _screenSize: string
      _os: string
      _versionOs: string
    }
  ) {
    return this.sendTransaction({
      from,
      to,
      functionName: 'getActiveCodesByDeviceInfo',
      abiData: activeCodeAbi.getActiveCodesByDeviceInfo,
      feeType: 'read',
      inputData: inputData
    })
  }
}

export const activeCodeContract = new ActiveCodeContract()
