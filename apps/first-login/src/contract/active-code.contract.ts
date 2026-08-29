import { MtnContract } from '@metanodejs/mtn-contract'
import { activeCodeAbi } from './abi'
export interface ActiveCodeInfo {
  infoCode: {
    domain: string
    installUrl: string
    bundleId: string
    platform: string
    createTime: string | number
  }
  infoActive: {
    IP: string
    screenSize: string
    os: string
    versionOs: string
    refCode: string
    activeCode: string | number
    timestamp: string | number
  }
}

export class ActiveCodeContract extends MtnContract {
  constructor() {
    super({ to: '' })
  }

  getActiveCodeInfo(from: string, to: string, _activeCode: string): Promise<ActiveCodeInfo> {
    return this.sendTransaction<ActiveCodeInfo>({
      from,
      to,
      functionName: 'getActiveCodeInfo',
      abiData: activeCodeAbi.getActiveCodeInfo,
      feeType: 'read',
      inputData: {
        _activeCode,
      },
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
    },
  ): Promise<string[]> {
    return this.sendTransaction<string[]>({
      from,
      to,
      functionName: 'getActiveCodesByDeviceInfo',
      abiData: activeCodeAbi.getActiveCodesByDeviceInfo,
      feeType: 'read',
      inputData: inputData,
    })
  }
}

export const activeCodeContract = new ActiveCodeContract()
