import { Role, Status } from '@/@types/enum'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib'
import { useDisableUser } from '@/modules/chat-admin/disable-user'
import { useEnableUser } from '@/modules/chat-admin/enable-user'
import { useRemoveAdmin } from '@/modules/chat-admin/remove-admin'
import { useTransferOwner } from '@/modules/chat-admin/transfer-owner'
import type { Row } from '@tanstack/react-table'
import { type ReactNode } from 'react'

export type UserManaderTableProps = {
  className?: string
}

export function UserRowContextMenu({ row, children }: { row: Row<User>; children: ReactNode }) {
  const user = row.original

  const { isOwner } = useRole()
  const disableUser = useDisableUser(user.address)
  const enableUser = useEnableUser(user.address)
  const transferAdmin = useTransferOwner(user.address)
  const removeAdmin = useRemoveAdmin(user.address)

  const loading =
    disableUser.isPending ||
    enableUser.isPending ||
    transferAdmin.isPending ||
    removeAdmin.isPending

  return (
    <ContextMenu>
      <ContextMenuTrigger className={cn(loading && 'opacity-70 pointer-events-none')} asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        {user.role === Role.user && (
          <>
            {user.status === Status.active ? (
              <ContextMenuItem onClick={() => disableUser.mutate()}>Disble User</ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={() => enableUser.mutate()}>Enable User</ContextMenuItem>
            )}
          </>
        )}
        {isOwner && user.role === Role.admin && (
          <>
            <ContextMenuItem onClick={() => transferAdmin.mutate()}>Transfer Admin</ContextMenuItem>
            <ContextMenuItem onClick={() => removeAdmin.mutate()}>Remove Admin</ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
