'use client'
import type { ReplyReference } from '@/modules/message'
import { useI18N } from '@/shared/hooks'
import { useScrollToMessageItem } from '@/shared/hooks/use-scroll-to-message-item'
import { cn } from '@/shared/lib'
import { MicIcon } from 'lucide-react'
import * as React from 'react'
import ReplyMessageFile from './reply-message-file'
import ReplyMessageSticker from './reply-message-sticker'
import ReplyMessageText from './reply-message-text'

interface ReplyMessageViewProps {
  replyTo: ReplyReference
  replyToUser?: string
  isMine?: boolean
}

function ReplyMessageView({ replyTo, replyToUser = 'Người dùng', isMine }: ReplyMessageViewProps) {
  const scrollTo = useScrollToMessageItem(replyTo.messageId)
  const { t } = useI18N()

  const replyPreview = React.useMemo(() => {
    switch (replyTo.type) {
      case 'text':
        return <ReplyMessageText message={replyTo as ReplyReference<'text'>} isMine={isMine} />

      case 'sticker':
        return <ReplyMessageSticker message={replyTo as ReplyReference<'sticker'>} />

      case 'file':
        return <ReplyMessageFile message={replyTo as ReplyReference<'file'>} isMine={isMine} />

      case 'voice':
        return (
          <span className="flex items-center gap-1 opacity-70 italic text-xs">
            <MicIcon size={14} />
            {t('message.type.voice', { defaultValue: '[Voice Memo]' })}
          </span>
        )
      default:
        return null
    }
  }, [replyTo])
  return (
    <div
      className={cn(
        'min-h-12 flex items-center gap-2 text-white rounded-md relative mb-1 py-1',
        isMine ? 'bg-blue-700' : 'bg-blue-200'
      )}
      onClick={scrollTo}
    >
      <span className="h-full w-[3px] rounded-l-md bg-blue-500 absolute left-0" />

      <div className="h-full flex-1 flex items-center gap-2 px-3">
        <div className="flex-1 overflow-hidden">
          <div
            className={cn(
              'text-sm font-semibold line-clamp-1',
              isMine ? 'text-blue-400' : 'text-[#3b82f6]'
            )}
          >
            Reply to {replyToUser}
          </div>
          {replyPreview}
        </div>
      </div>
    </div>
  )
}

export default React.memo(ReplyMessageView)
