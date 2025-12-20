import WapperSetting from '@/shared/components/wapper-setting'
import * as React from 'react'
import { BiometricAuthentication } from './actions'

function SecureSetting() {
  return (
    <div className="mt-3 flex flex-col gap-3">
      <WapperSetting>
        <BiometricAuthentication />
      </WapperSetting>
    </div>
  )
}

export default React.memo(SecureSetting)
