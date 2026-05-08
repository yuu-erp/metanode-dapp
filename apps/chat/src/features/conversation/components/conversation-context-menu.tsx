import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/shared/components/ui/context-menu'
import { useRemoveConversation } from '@/shared/hooks/use-remove-conversation'
import { memo, type PropsWithChildren } from 'react'

export type ConversationContextMenuProps = {
  conversationId: string
  type: string
} & PropsWithChildren

export const ConversationContextMenu = memo(
  ({ children, conversationId, type }: ConversationContextMenuProps) => {
    const { mutate: removeConversation } = useRemoveConversation(conversationId, type)
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => removeConversation()}>
            Delete conversation
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }
)
