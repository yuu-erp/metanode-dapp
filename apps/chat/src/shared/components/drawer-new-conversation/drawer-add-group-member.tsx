import { useAddMember, useGetConversations, useGetGroupMembers } from '@/features/conversation'
import type { ConversationType, PayloadAddMembers } from '@/modules/conversation'
import { useCurrentAccount, useGetConversationId, useI18N } from '@/shared/hooks'
import { useParams, useSearch } from '@tanstack/react-router'
import { CheckIcon, Loader2Icon, Plus } from 'lucide-react'
import React, { memo, useCallback, useMemo } from 'react'
import { Drawer } from 'vaul'
import { SelectMembers } from './groups'

const DrawerAddGroupMember = memo(() => {
  const { id } = useParams({ from: '/_authenticated/group/$id' })
  const { t } = useI18N()
  const search: { type: ConversationType } = useSearch({ from: '/_authenticated/group/$id' })
  const [open, setOpen] = React.useState(false)
  const { data: account } = useCurrentAccount()
  const { data: conversations = [] } = useGetConversations(account?.address)
  const [selectedMembers, setSelectedMembers] = React.useState<PayloadAddMembers[]>([])
  const conversationType = search.type?.split('?')[0] as ConversationType
  const { data: conversation } = useGetConversationId(id, conversationType)

  const { data: groupMembers = [] } = useGetGroupMembers(
    account?.address,
    conversation?.conversationId,
    conversationType
  )
  const { mutateAsync, isPending } = useAddMember(conversationType)
  const validConversations = useMemo(() => {
    if (!conversations || !groupMembers) return []
    return conversations.filter(
      (item) => item.conversationType === 'p2p' && !groupMembers.includes(item.conversationId)
    )
  }, [conversations, groupMembers])

  const handleSelectMember = React.useCallback((mem: PayloadAddMembers) => {
    setSelectedMembers((prev) => {
      if (prev.some((item) => item.conversationId === mem.conversationId)) {
        return prev.filter((member) => member.conversationId !== mem.conversationId)
      }
      return [...prev, mem]
    })
  }, [])

  const submit = useCallback(async () => {
    await mutateAsync({
      account: account!,
      members: selectedMembers,
      group: conversation!
    })
    setOpen(false)
  }, [account, selectedMembers, conversation])

  return (
    <Drawer.Root shouldScaleBackground open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button aria-label="New message">
          <Plus className="size-7 text-white" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
          <div className="relative h-[90vh] rounded-t-[36px] bg-black/30 backdrop-blur-md border border-white/10 flex flex-col overflow-hidden">
            <div className="max-w-md mx-auto w-full flex flex-col overflow-hidden">
              <div className="flex flex-col items-center pt-5 relative">
                <Drawer.Title className="text-gray-100 font-semibold text-lg">
                  {t('drawer.addMember', { defaultValue: 'Add Member' })}
                </Drawer.Title>
                <span className="text-gray-400 text-sm">
                  {t('drawer.selectMembers', {
                    count: selectedMembers.length,
                    defaultValue: `${selectedMembers.length} Select members`
                  })}
                </span>

                <button
                  className="absolute right-4 size-10 rounded-full bg-[#2c2c2e] border border-white/10 shadow-lg flex items-center justify-center transition active:scale-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={submit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2Icon className="size-5 text-gray-100 animate-spin" />
                  ) : (
                    <CheckIcon className="size-5 text-gray-100" />
                  )}
                </button>
              </div>

              <div className="overflow-y-auto">
                <SelectMembers
                  account={account}
                  conversations={validConversations}
                  selectedMembers={selectedMembers}
                  handleSelectMember={handleSelectMember}
                />
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
})

export default DrawerAddGroupMember
