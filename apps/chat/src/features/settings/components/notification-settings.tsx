'use client'

import { Switch } from '@headlessui/react'
import * as React from 'react'
import { useDetailedSettings, useSetP2PChatEnabled, useSetReactionsEnabled } from '../hooks'
import WapperSetting from './wapper-setting'

export default function NotificationSettings() {
  const { data: detailedSettings } = useDetailedSettings()
  const { mutate: setP2PChatEnabled } = useSetP2PChatEnabled()
  const { mutate: setReactionsEnabled } = useSetReactionsEnabled()

  const [receiveP2P, setReceiveP2P] = React.useState(true)
  const [receiveReactions, setReceiveReactions] = React.useState(true)

  React.useEffect(() => {
    if (detailedSettings) {
      setReceiveP2P(detailedSettings.p2pChatEnabled ?? true)
      setReceiveReactions(detailedSettings.reactionsEnabled ?? true)
    }
  }, [detailedSettings])

  return (
    <div className="flex flex-col gap-3 px-3">
      <WapperSetting>
        <div className="flex items-center justify-between">
          <span className="font-medium text-base">Receive P2P Chat Requests</span>
          <Switch
            checked={receiveP2P}
            onChange={(checked) => {
              setReceiveP2P(checked)
              setP2PChatEnabled(checked)
            }}
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
            onChange={(checked) => {
              setReceiveReactions(checked)
              setReactionsEnabled(checked)
            }}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
          </Switch>
        </div>
      </WapperSetting>
    </div>
  )
}
