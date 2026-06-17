import { EllipsisVertical } from 'lucide-react'
import { memo } from 'react'
import { MorePopover } from './more-popover'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'

export type MoreButtonProps = {}

export const MoreButton = memo(({}: MoreButtonProps) => {
  const { type } = useConversationParams()
  if (type === 'p2p') return null
  return (
    <MorePopover>
      <EllipsisVertical />
    </MorePopover>
  )
})
