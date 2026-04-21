'use client'

import * as React from 'react'
import WapperSetting from './wapper-setting'
import { BellRing, LogOut } from 'lucide-react'
import { useLogout } from '../hooks'

function ListSettings() {
  const { mutateAsync } = useLogout()

  const handleClickLogout = async () => await mutateAsync()
  return (
    <div className="px-3 flex flex-col gap-3">
      <WapperSetting>
        <div className="flex items-center gap-2 font-medium text-base" onClick={handleClickLogout}>
          <BellRing className="size-5" />
          <span>Notifications and Sounds</span>
        </div>
      </WapperSetting>
      <WapperSetting>
        <div className="flex items-center gap-2 font-medium text-base" onClick={handleClickLogout}>
          <LogOut className="size-5" />
          <span>Log out</span>
        </div>
      </WapperSetting>
    </div>
  )
}

export default React.memo(ListSettings)
