'use client'

import { EditIcon } from '@/shared/components/icons'
import * as React from 'react'
import { Drawer } from 'vaul'
import DefaultConversation from './default-conversatiom'
import { NewGroup } from './groups'
import { useCurrentAccount } from '@/shared/hooks'
import { useGetConversations } from '../../hooks'

export enum ScreenType {
  DEFAULT = 'DEFAULT',
  NEW_GROUP = 'NEW_GROUP'
}

function DrawerNewConversation() {
  const { data: account } = useCurrentAccount()
  const { data: conversations } = useGetConversations(account?.address)

  const [screenType, setScreenType] = React.useState<ScreenType>(ScreenType.DEFAULT)
  const [open, setOpen] = React.useState(false)

  const onChangeScreenType = React.useCallback(
    (screenType: ScreenType) => setScreenType(screenType),
    []
  )

  const onClose = React.useCallback(() => {
    setOpen(false)
    // Reset screen type after close animation
    setTimeout(() => setScreenType(ScreenType.DEFAULT), 300)
  }, [])

  const renderScreen = React.useMemo(() => {
    switch (screenType) {
      case ScreenType.DEFAULT:
        return (
          <DefaultConversation
            conversations={conversations}
            account={account}
            onChangeScreenType={onChangeScreenType}
          />
        )
      case ScreenType.NEW_GROUP:
        return (
          <NewGroup
            onChangeScreenType={onChangeScreenType}
            conversations={conversations}
            account={account}
            onClose={onClose}
          />
        )
      default:
        return (
          <DefaultConversation
            conversations={conversations}
            account={account}
            onChangeScreenType={onChangeScreenType}
          />
        )
    }
  }, [screenType, conversations, account, onChangeScreenType, onClose])

  return (
    <Drawer.Root shouldScaleBackground open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button aria-label="New message">
          <EditIcon className="size-7 text-white" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
          <div className="relative h-[90vh] rounded-t-[36px] bg-black/30 backdrop-blur-md border border-white/10 flex flex-col overflow-hidden">
            <div className="max-w-md mx-auto w-full flex flex-col overflow-hidden">
              {renderScreen}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default React.memo(DrawerNewConversation)
