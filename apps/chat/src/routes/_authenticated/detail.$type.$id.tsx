import { DetailHeader } from '@/components/detail/detail-header'
import { GroupEditableAvatar } from '@/components/detail/group-editable-avatar'
import { GroupMembers } from '@/components/detail/group-members'
import { useUpdateGroupInfo } from '@/hooks/group/use-update-group-info'
import { useCurrentConversation } from '@/shared/hooks/conversations/use-current-conversation'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated/detail/$type/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const { type } = useConversationParams()
  const { conversation } = useCurrentConversation()
  const [isEdit, setIsEdit] = useState(false)
  const name = conversation?.name ?? ''
  const [value, setValue] = useState('')
  const { mutate } = useUpdateGroupInfo()

  useEffect(() => {
    if (!name) return
    setValue(name)
  }, [name])

  console.log('value', value)
  console.log('name', name)

  useEffect(() => {
    if (isEdit) return
    if (!value) return setValue(conversation?.name ?? '')
    if (value === name) return

    mutate({
      name: value
    })
  }, [isEdit, value, name])

  return (
    <div className="size-full flex flex-col overflow-hidden gap-3">
      <DetailHeader isEdit={isEdit} setIsEdit={setIsEdit} />
      <GroupEditableAvatar
        isEdit={false}
        name={conversation?.name ?? ''}
        type={type}
        remoteUrl={conversation?.avatar}
      />
      <input
        className="text-xl font-bold mx-auto text-center focus:outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {(type === 'group' || type === 'anonymous_group') && <GroupMembers />}
    </div>
  )
}
