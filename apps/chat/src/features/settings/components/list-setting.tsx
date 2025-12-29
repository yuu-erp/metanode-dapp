'use client'

import * as React from 'react'
import WapperSetting from './wapper-setting'
import { LogOut } from 'lucide-react'
import { useLogout } from '../hooks'

function ListSettings() {
  const { mutateAsync } = useLogout()

  const handleClickLogout = async () => await mutateAsync()
  return (
    <React.Fragment>
      <div className="px-3 pt-14">
        <WapperSetting>
          <div className="flex items-center gap-2 font-semibold" onClick={handleClickLogout}>
            <LogOut />
            <span>Log out</span>
          </div>
        </WapperSetting>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ListSettings)
