'use client'

import * as React from 'react'
import { Switch } from '@headlessui/react'
import WapperSetting from './wapper-setting'

export default function NotificationSettings() {
  const [receiveP2P, setReceiveP2P] = React.useState(true)
  const [receiveReactions, setReceiveReactions] = React.useState(true)

  return (
    <div className="flex flex-col gap-3 px-3">
      <WapperSetting>
        <div className="flex items-center justify-between">
          <span className="font-medium text-base">Receive P2P Chat Requests</span>
          <Switch
            checked={receiveP2P}
            onChange={setReceiveP2P}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </div>
      </WapperSetting>

      <WapperSetting>
        <div className="flex items-center justify-between">
          <span className="font-medium text-base">Receive Reactions</span>
          <Switch
            checked={receiveReactions}
            onChange={setReceiveReactions}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </div>
      </WapperSetting>
    </div>
  )
}
