'use client'
import * as React from 'react'
import { Button } from '../ui/button'
import { CircleUserRound, MessageCircle, Phone, Settings } from 'lucide-react'

function NavbarMenu() {
  return (
    <React.Fragment>
      <div
        className="h-[86px] fixed bottom-5 left-5 right-5 bg-black/20 border-app rounded-full"
        style={{
          boxShadow: '4px -4px 16px 0px #FFFFFF2E inset, 0px -2px 16px 0px #FFFFFF85 inset'
        }}
      >
        <div className="h-full w-full flex items-center justify-around px-3">
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-12 rounded-full bg-black/40"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <CircleUserRound className="size-5" />
            </Button>
            <span className="text-xs font-semibold">Danh bạ</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-12 rounded-full bg-black/40"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <Phone className="size-5" />
            </Button>
            <span className="text-xs font-semibold">Cuộc gọi</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-12 rounded-full bg-black/40"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <MessageCircle className="size-5" />
            </Button>
            <span className="text-xs font-semibold">Chat</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Button
              className="size-12 rounded-full bg-black/40"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <Settings className="size-5" />
            </Button>
            <span className="text-xs font-semibold">Cài đặt</span>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(NavbarMenu)
