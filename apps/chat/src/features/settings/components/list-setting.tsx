'use client'

import * as React from 'react'
import WapperSetting from './wapper-setting'
import { BellRing, LogOut } from 'lucide-react'
import { useLogout } from '../hooks'
import { useNavigate } from '@tanstack/react-router'

function ListSettings() {
  const { mutateAsync } = useLogout()
  const navigate = useNavigate()

  const handleClickLogout = async () => await mutateAsync()

  return (
    <div className="px-3 flex flex-col gap-3">
      <WapperSetting>
        <div
          className="flex items-center gap-2 font-medium text-base"
          onClick={() => navigate({ to: '/settings/notifications' })}
        >
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
