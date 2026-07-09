'use client'

import { usePlatform } from '@/hooks/core/use-platform'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { UserAddIcon, UserGroupIcon } from '@/shared/components/icons'
import { Button } from '@/shared/components/ui/button'
import { useI18N } from '@/shared/hooks'

import { useCreateMeeting } from '@/shared/hooks/call/use-create-meeting'
import { cn } from '@/shared/lib'
import { Megaphone, QrCode, Video, X } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'
import { useScanQrcodeProfile } from '../../../features/conversation/hooks'
import { ScreenType } from './drawer-new-conversation'
import { HeaderSection } from './sections'

interface DefaultConversationProps {
  conversations?: Conversation[]
  account?: Account
  onChangeScreenType?: (screenType: ScreenType) => void
  onClose?: () => void
}
function DefaultConversation({ account, onChangeScreenType, onClose }: DefaultConversationProps) {
  const { t } = useI18N()
  const { isNotWeb } = usePlatform()

  const { mutate } = useScanQrcodeProfile()

  const handleClickScanQR = React.useCallback(() => {
    if (!account) return
    mutate(account)
  }, [account, mutate])

  const { onGoMeeting, onJoinLink } = useCreateMeeting(account, onClose)

  return (
    <React.Fragment>
      <HeaderSection>
        <div className="w-full h-full flex items-center justify-center">
          <Drawer.Close asChild>
            <Button className="absolute left-4 size-10 rounded-full bg-transparent border border-white/10 shadow-lg flex items-center justify-center transition active:scale-80">
              <X className="size-5 " />
            </Button>
          </Drawer.Close>

          <Drawer.Title className="font-semibold text-lg text-black">
            {t('drawer.newMessage', { defaultValue: 'New Message' })}
          </Drawer.Title>

          {isNotWeb && (
            <Button
              type="button"
              onClick={handleClickScanQR}
              className="size-12 shrink-0 rounded-full border shadow-lg flex items-center justify-center transition active:scale-95
              btn
              absolute right-4
              "
            >
              <QrCode className="size-6 " />
            </Button>
          )}
        </div>
        {/* Search + QR */}
        <div className="flex items-center gap-2 px-4"></div>
      </HeaderSection>
      <div className="no-scrollbar w-full flex-1 px-4 pb-6 flex flex-col overflow-y-auto pt-[80px]">
        {/* Telegram Actions */}
        <div className="flex flex-col w-full">
          {/* New Contact */}
          <button
            className="w-full h-12 flex items-center gap-4 text-left transition "
            onClick={() => onChangeScreenType?.(ScreenType.NEW_CONTACT)}
          >
            <UserAddIcon className="size-6 text-myapp" />
            <span className="font-medium text-myapp">
              {t('drawer.newContact', { defaultValue: 'New Contact' })}
            </span>
          </button>

          <div className="h-px bg-white/20 ml-10" />

          {/* New Group */}
          <button
            onClick={() => onChangeScreenType?.(ScreenType.NEW_GROUP)}
            className="w-full h-12 flex items-center gap-4 text-left transition"
          >
            <UserGroupIcon className="size-6 text-myapp" />
            <span className="font-medium text-myapp">
              {t('drawer.newGroup', { defaultValue: 'New Group' })}
            </span>
          </button>

          <div className="h-px bg-white/20 ml-10" />

          <button
            onClick={() => onChangeScreenType?.(ScreenType.NEW_ANONYMOUS_GROUP)}
            className="w-full h-12 flex items-center gap-4 text-left transition"
          >
            <UserGroupIcon className="size-6 text-myapp" />
            <span className="font-medium text-myapp">
              {t('drawer.newAnonymousGroup', { defaultValue: 'New Anonymous Group' })}
            </span>
          </button>

          <div className="h-px bg-white/20 ml-10" />

          <button
            className={cn('w-full h-12 flex items-center gap-4 text-left transition ')}
            onClick={onGoMeeting}
          >
            <Video className="size-6 text-myapp" />
            <span className="font-medium text-myapp">
              {t('drawer.newMeeting', { defaultValue: 'New Meeting' })}
            </span>
          </button>

          <div className="h-px bg-white/20 ml-10" />

          <button
            className={cn('w-full h-12 flex items-center gap-4 text-left transition ')}
            onClick={onJoinLink}
          >
            <Video className="size-6 text-myapp" />
            <span className="font-medium text-myapp">
              {t('drawer.newMeetingByUrl', { defaultValue: 'New Meeting By Url' })}
            </span>
          </button>

          <div className="h-px bg-white/20 ml-10" />

          {/* New Channel */}
          <button
            className="w-full h-14 flex items-center gap-4 text-left transition disabled:opacity-50 cursor-not-allowed"
            disabled
          >
            <Megaphone className="size-5 text-myapp" />
            <span className="font-medium text-myapp">
              {t('drawer.newChannel', { defaultValue: 'New Channel' })}
            </span>
          </button>
        </div>
        {/* List conversation */}
        {/* <div className="flex flex-1 w-full flex-col gap-3 mt-3">
          {conversations.map((conversation) => (
            <React.Fragment key={conversation.conversationId}>
              <ConversationContact
                name={conversation.name}
                username={conversation.username}
                type={conversation.conversationType}
                onClick={() => {
                  onClose?.()
                  navigate({
                    to: '/$type/$id',
                    params: { id: conversation.conversationId, type: 'p2p' }
                  })
                }}
              />
              <div className="h-px bg-white/20 ml-18" />
            </React.Fragment>
          ))}
        </div> */}
      </div>
    </React.Fragment>
  )
}

export default React.memo(DefaultConversation)
