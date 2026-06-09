'use client'

import { useCurrentAccount } from '@/shared/hooks'
import { copyClipboard } from '@metanodejs/system-core'
import { useNavigate } from '@tanstack/react-router'
import { BellRing, LogOut, Wallet } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { useLogout } from '../hooks'
import WapperSetting from './wapper-setting'

function ListSettings() {
  const { mutateAsync } = useLogout()
  const navigate = useNavigate()
  const { data: account } = useCurrentAccount()

  const handleClickLogout = async () => await mutateAsync()

  const onCopy = async (value: string) => {
    if (window.fiaiSDK) {
      await navigator.clipboard.writeText(value)
    } else {
      await copyClipboard(value)
    }
    toast.success('Copy success')
  }

  const onCopyHiddenAddres = async () => {
    await onCopy(account?.hiddenAddress ?? '')
  }

  const onCopyCurrentAddress = async () => {
    await onCopy(account?.address ?? '')
  }

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
      <WapperSetting>
        <div className="flex items-center gap-2 font-medium text-base" onClick={onCopyHiddenAddres}>
          <Wallet className="size-5" />
          <span>Copy Hidden Wallet</span>
        </div>
      </WapperSetting>

      <WapperSetting>
        <div
          className="flex items-center gap-2 font-medium text-base"
          onClick={onCopyCurrentAddress}
        >
          <Wallet className="size-5" />
          <span>Copy Wallet Address</span>
        </div>
      </WapperSetting>
    </div>
  )
}

export default React.memo(ListSettings)
