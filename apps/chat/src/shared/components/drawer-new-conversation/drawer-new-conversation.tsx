'use client'

import { EditIcon } from '@/shared/components/icons'
import * as React from 'react'
import { Drawer } from 'vaul'
import DefaultConversation from './default-conversatiom'
import { NewGroup } from './groups'
import { useCurrentAccount } from '@/shared/hooks'
import { useGetConversations } from '../../../features/conversation/hooks'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog'
import { NewContact } from './new-contact'

export enum ScreenType {
  DEFAULT = 'DEFAULT',
  NEW_GROUP = 'NEW_GROUP',
  NEW_ANONYMOUS_GROUP = 'NEW_ANONYMOUS_GROUP',
  NEW_CONTACT = 'NEW_CONTACT'
}

function DrawerNewConversation() {
  const { data: account } = useCurrentAccount()
  const { data: conversations } = useGetConversations(account)

  const [screenType, setScreenType] = React.useState<ScreenType>(ScreenType.DEFAULT)

  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

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
      case ScreenType.NEW_CONTACT:
        return <NewContact onChangeScreenType={onChangeScreenType} onClose={onClose} />

      case ScreenType.DEFAULT:
        return (
          <DefaultConversation
            conversations={conversations}
            account={account}
            onChangeScreenType={onChangeScreenType}
            onClose={onClose}
          />
        )
      case ScreenType.NEW_GROUP:
        return (
          <NewGroup
            onChangeScreenType={onChangeScreenType}
            conversations={conversations}
            account={account}
            onClose={onClose}
            type="group"
          />
        )

      case ScreenType.NEW_ANONYMOUS_GROUP:
        return (
          <NewGroup
            onChangeScreenType={onChangeScreenType}
            conversations={conversations}
            account={account}
            onClose={onClose}
            type="anonymous_group"
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

  if (isMobile) {
    return (
      <Drawer.Root shouldScaleBackground open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <button aria-label="New message">
            <EditIcon className="size-7" />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
            <div className="relative h-[90vh] rounded-t-[36px] backdrop-blur-md-app border flex flex-col overflow-hidden bg-modal">
              <div className="w-full flex flex-col overflow-hidden">{renderScreen}</div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button aria-label="New message">
          <EditIcon className="size-7" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 border-none shadow-none bg-modal">
        <div className="relative h-[600px] w-full rounded-2xl backdrop-blur-md-app border border-white/10 flex flex-col overflow-hidden">
          {renderScreen}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(DrawerNewConversation)
