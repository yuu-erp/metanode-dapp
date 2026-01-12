'use client'
import AvatarUser from '@/shared/components/avatar-user'
import { useCurrentAccount } from '@/shared/hooks'
import * as React from 'react'
import DrawerQRCode from './drawer-qr-code'

function ProfileInfo() {
  const { data: account } = useCurrentAccount()
  return (
    <div
      className="
        w-full h-[96px] mt-3 rounded-3xl
        bg-white/70 text-gray-900
        backdrop-blur-xl
        border border-white/30
        flex items-center px-3 gap-2
      "
      style={{
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
      }}
    >
      <AvatarUser name="Yuu" size="xl" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <div className="w-full flex items-center justify-between gap-3">
          <div className="text-xl font-bold flex-1 line-clamp-1 break-all text-gray-800">
            {account?.name}
          </div>
          <div className="flex items-center gap-2">
            {account && <DrawerQRCode account={account} />}
          </div>
        </div>
        <div className="text-xs flex-1 line-clamp-1 break-all text-gray-600">
          {account?.address}
        </div>
        {account && account.username && (
          <div className="flex-1 text-xs break-all text-gray-800 line-clamp-1">
            @{account.username}
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(ProfileInfo)
