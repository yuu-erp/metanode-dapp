import { useTransferAdmin } from '@/hooks/group/use-transfer-admin'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/shared/components/ui/context-menu'
import { useAdmin } from '@/shared/hooks/group/use-admin'
import { memo, type PropsWithChildren } from 'react'

export type MemberItemContextMenuProps = {
  user: string
} & PropsWithChildren

export const MemberItemContextMenu = memo(({ children, user }: MemberItemContextMenuProps) => {
  const { isAdmin } = useAdmin()
  const { mutate: transferAdmin } = useTransferAdmin()
  if (!isAdmin) return children
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <p>Remove</p>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => transferAdmin(user)}>
          <p>Transfer admin</p>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})
