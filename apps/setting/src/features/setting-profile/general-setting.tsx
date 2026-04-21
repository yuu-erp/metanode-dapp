import * as React from 'react'
import { Language, Vibration } from './actions'
import WapperSetting from '@/shared/components/wapper-setting'

function GeneralSetting() {
  return (
    <div className="mt-3 flex flex-col gap-3">
      <WapperSetting>
        <Vibration />
      </WapperSetting>
      <div className="grid gap-2">
        <p className="font-semibold">Language</p>
        <WapperSetting>
          <Language />
        </WapperSetting>
      </div>
    </div>
  )
}

export default React.memo(GeneralSetting)
