'use client'
import { useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { MessageIcon, PhoneIcon, SettingsIcon, UserIcon } from '../icons'
import TotalUnreadcount from '../total-unreadcount'
import { Button } from '../ui/button'

function NavbarMenu() {
  const navigate = useNavigate()
  return (
    <React.Fragment>
      <div
        className="h-[84px] fixed left-5 bottom-5 right-5 bg-black/20 border-app rounded-full"
        style={{
          boxShadow: '4px -4px 16px 0px #FFFFFF2E inset, 0px -2px 16px 0px #FFFFFF85 inset'
          // bottom: 'env(safe-area-inset-bottom, 12px)'
        }}
      >
        <div className="h-full w-full flex items-center justify-around px-3">
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-14 rounded-full bg-black/40 relative"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <UserIcon className="size-8" />
            </Button>
            {/* <span className="text-xs font-semibold">Danh bạ</span> */}
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-14 rounded-full bg-black/40 relative"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <PhoneIcon className="size-8" />
            </Button>
            {/* <span className="text-xs font-semibold">Cuộc gọi</span> */}
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-14 rounded-full bg-black/40 relative"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
              onClick={() => navigate({ to: '/' })}
            >
              <TotalUnreadcount className="absolute top-1 right-1" variant="destructive" />
              <MessageIcon className="size-8" />
            </Button>
            {/* <span className="text-xs font-semibold">Chat</span> */}
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-14 rounded-full bg-black/40 relative"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
              onClick={() => navigate({ to: '/settings' })}
            >
              <SettingsIcon className="size-8" />
            </Button>
            {/* <span className="text-xs font-semibold">Cài đặt</span> */}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(NavbarMenu)
