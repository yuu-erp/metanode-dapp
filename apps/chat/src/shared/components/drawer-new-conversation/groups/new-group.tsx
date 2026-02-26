'use client'

import * as React from 'react'
import SelectMembers from './select-members'
import GroupInfo from './group-info'
import { HeaderSection } from '../sections'
import { Drawer } from 'vaul'
import { CheckIcon, ChevronLeftIcon, Loader2Icon } from 'lucide-react'
import { ScreenType } from '../drawer-new-conversation'
import type { Conversation, ConversationType, PayloadAddMembers } from '@/modules/conversation'
import type { Account } from '@/modules/account'
import { cn } from '@/shared/lib'
import { Input } from '@/shared/components/ui/input'
import { useCreateGroup } from '@/features/conversation/hooks'
import { useI18N } from '@/shared/hooks'

export enum ScreenGroupType {
  SELECT_MEMBERS = 'SELECT_MEMBERS',
  GROUP_INFO = 'GROUP_INFO'
}

interface NewGroupProps {
  onChangeScreenType: (type: ScreenType) => void
  conversations?: Conversation[]
  account?: Account
  onClose?: () => void
  type?: ConversationType
}
function NewGroup({
  onChangeScreenType,
  conversations = [],
  account,
  onClose,
  type = 'group'
}: NewGroupProps) {
  const { mutateAsync: createGroup, isPending: isCreatingGroup } = useCreateGroup(type)
  const { t } = useI18N()

  const [screenType, setScreenType] = React.useState<ScreenGroupType>(
    ScreenGroupType.SELECT_MEMBERS
  )
  const [selectedMembers, setSelectedMembers] = React.useState<PayloadAddMembers[]>([])
  const [groupName, setGroupName] = React.useState('')

  const onChangeScreenGroupType = React.useCallback(
    (screenType: ScreenGroupType) => setScreenType(screenType),
    []
  )

  const handleSelectMember = React.useCallback((mem: PayloadAddMembers) => {
    setSelectedMembers((prev) => {
      if (prev.some((item) => item.conversationId === mem.conversationId)) {
        return prev.filter((member) => member.conversationId !== mem.conversationId)
      }
      return [...prev, mem]
    })
  }, [])

  const renderScreen = React.useMemo(() => {
    switch (screenType) {
      case ScreenGroupType.SELECT_MEMBERS:
        return (
          <SelectMembers
            conversations={conversations}
            account={account}
            selectedMembers={selectedMembers}
            handleSelectMember={handleSelectMember}
          />
        )
      case ScreenGroupType.GROUP_INFO:
        return (
          <GroupInfo
            conversations={conversations}
            selectedMembers={selectedMembers}
            groupName={groupName}
            setGroupName={setGroupName}
          />
        )
      default:
        return (
          <SelectMembers
            conversations={conversations}
            account={account}
            selectedMembers={selectedMembers}
            handleSelectMember={handleSelectMember}
          />
        )
    }
  }, [
    screenType,
    conversations,
    selectedMembers,
    groupName,
    handleSelectMember,
    setGroupName,
    onChangeScreenGroupType
  ])

  const isNext = React.useMemo(() => selectedMembers.length > 0, [selectedMembers])

  const handleNext = React.useCallback(async () => {
    if (screenType === ScreenGroupType.SELECT_MEMBERS && isNext) {
      onChangeScreenGroupType(ScreenGroupType.GROUP_INFO)
    } else if (screenType === ScreenGroupType.GROUP_INFO && groupName) {
      await createGroup({
        account: account!,
        payload: {
          name: groupName,
          members: selectedMembers
        }
      })
      onClose?.()
    }
  }, [isNext, onChangeScreenGroupType, groupName, createGroup, account, onClose, selectedMembers])

  const handleBack = React.useCallback(() => {
    if (screenType === ScreenGroupType.GROUP_INFO) {
      onChangeScreenGroupType(ScreenGroupType.SELECT_MEMBERS)
    } else {
      onChangeScreenType(ScreenType.DEFAULT)
    }
  }, [screenType, onChangeScreenGroupType, onChangeScreenType])

  return (
    <React.Fragment>
      <HeaderSection>
        <div className="w-full h-full flex items-center justify-center">
          <button
            className="absolute left-4 size-10 rounded-full bg-[#2c2c2e] border border-white/10 shadow-lg flex items-center justify-center transition active:scale-80"
            onClick={handleBack}
          >
            <ChevronLeftIcon className="size-5 text-gray-100" />
          </button>
          <div className="flex flex-col items-center">
            <Drawer.Title className="text-gray-100 font-semibold text-lg">
              {t('drawer.newGroup', { defaultValue: 'New Group' })}
            </Drawer.Title>
            <span className="text-gray-400 text-sm">
              {screenType === ScreenGroupType.GROUP_INFO
                ? t('drawer.groupInfo', { defaultValue: 'Group Info' })
                : t('drawer.selectMembers', {
                    count: selectedMembers.length,
                    defaultValue: `${selectedMembers.length} Select members`
                  })}
            </span>
          </div>
          <button
            className="absolute right-4 size-10 rounded-full bg-[#2c2c2e] border border-white/10 shadow-lg flex items-center justify-center transition active:scale-80 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={!isNext || isCreatingGroup}
          >
            {isCreatingGroup ? (
              <Loader2Icon className="size-5 text-gray-100 animate-spin" />
            ) : (
              <CheckIcon className="size-5 text-gray-100" />
            )}
          </button>
        </div>
        {/* Search + QR */}
        {screenType === ScreenGroupType.SELECT_MEMBERS && (
          <div className="flex items-center gap-2 px-4">
            <Input
              type="text"
              placeholder={t('search.addressOrUsername', {
                defaultValue: 'Search address or username'
              })}
              className="flex-1 h-12 rounded-full px-4 text-sm bg-[#2c2c2e] text-gray-100 placeholder:text-gray-300 border border-white/10 outline-none transition"
            />
          </div>
        )}
      </HeaderSection>
      <div
        className={cn(
          'no-scrollbar w-full flex-1 px-4 pb-6 flex flex-col overflow-y-auto',
          screenType === ScreenGroupType.SELECT_MEMBERS ? 'pt-[140px]' : 'pt-[60px]'
        )}
      >
        {renderScreen}
      </div>
    </React.Fragment>
  )
}

export default React.memo(NewGroup)
