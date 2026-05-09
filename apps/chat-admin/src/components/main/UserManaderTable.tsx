import type { ColumnDef } from '@tanstack/react-table'
import { memo } from 'react'
import { DataTable } from '../ui/DataTable'
import { useUsers } from '@/modules/chat-admin/get-users'
import { cn, copy } from '@/lib'
import { Copy } from 'lucide-react'
import { UserStatus } from './user-status'
import { useUiStore } from '@/stores/ui.store'
import { useShallow } from 'zustand/shallow'

export type UserManaderTableProps = {
  className?: string
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'index',
    header: () => 'Index',
    cell: ({ row }) => {
      return row.index + 1
    }
  },
  {
    accessorKey: 'name',
    header: () => 'Name',
    cell: ({ row }) => {
      const value = row.getValue('name')
      return value
    }
  },
  {
    accessorKey: 'address',
    header: () => 'Address',
    cell: ({ row }) => {
      const value = row.getValue('address') as string

      return (
        <div className="flex gap-3 items-center max-w-40 overflow-hidden">
          <p className="flex-1 line-clamp-1">{value}</p>
          <Copy className="shrink-0 size-4" onClick={() => copy(value)} />
        </div>
      )
    }
  },
  {
    accessorKey: 'role',
    header: () => 'Role',
    cell: ({ row }) => {
      const value = row.getValue('role')
      return value
    }
  },
  {
    accessorKey: 'status',
    header: () => 'Status',
    cell: ({ row }) => {
      const value = row.getValue('status') as any
      return <UserStatus value={value} />
    }
  },
  {
    accessorKey: 'lastUpdate',
    header: () => 'Last Update',
    cell: ({ row }) => {
      const value = row.getValue('lastUpdate') as any
      return new Date(value).toLocaleDateString()
    }
  }
]

export const UserManaderTable = memo(({ className }: UserManaderTableProps) => {
  const { data = [] } = useUsers()
  const { status, role, searchValue } = useUiStore(
    useShallow((s) => ({
      status: s.status,
      role: s.role,
      searchValue: s.searchValue
    }))
  )

  function isMatch(value: string, search: string) {
    return value.trim().toLowerCase().includes(search.trim().toLowerCase())
  }

  const displayData = data.filter(
    (item) =>
      (role === 'all' ? true : item.role === role) &&
      (status === 'all' ? true : item.status === status) &&
      (!searchValue ? true : isMatch(item.address, searchValue) || isMatch(item.name, searchValue))
  )

  return (
    <div className={cn('mx-auto py-10 size-full overflow-hidden', className)}>
      <DataTable columns={columns} data={displayData} />
    </div>
  )
})
