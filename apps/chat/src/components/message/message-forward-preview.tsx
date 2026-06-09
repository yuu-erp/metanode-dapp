import { useName } from '@/new/user/user-info'
import AvatarUser from '@/shared/components/avatar-user'
import { cn } from '@/shared/lib'
import { memo } from 'react'

export type MessageForwardRreviPwProps = {
  data: FulleMessage
}

export const MessageForwardPreview = memo(({ data }: MessageForwardRreviPwProps) => {
  const { isMine, forwardFrom, forwardFromType } = data
  const { name } = useName(forwardFrom, forwardFromType)

  return (
    <div
      className={cn(
        'flex gap-1 items-center flex-wrap min-w-0 pb-3 text-sm',
        isMine ? 'text-white' : 'text-gray-800'
      )}
    >
      <span className="shrink-0">Forwarded from</span>

      <div className="flex items-center gap-1 min-w-0">
        <div className="shrink-0">
          <AvatarUser name={name} avatarSize={24} textSize={12} />
        </div>

        <span className="whitespace-nowrap font-semibold">{name}</span>
      </div>
    </div>
  )
})
