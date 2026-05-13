import { Role, Status } from '@/@types/enum'
import { displayRole } from '@/constant/display.const'
import { cn, copy } from '@/lib'
import { useAllAdmin } from '@/modules/chat-admin/all-admin'
import { useAllUsers } from '@/modules/chat-admin/all-user'
import {
  createAdminExecutorAppointedAtQuery,
  createUserDisabledAtQuery,
  createUserRegisteredAtQuery
} from '@/modules/chat-admin/last-update'
import {
  createIsUserDisabledQuery,
  createUserContractQuery,
  createUserInfoQuery
} from '@/modules/chat-admin/user-info'
import { useUiStore } from '@/stores/ui.store'
import { useQueries } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Copy } from 'lucide-react'
import { memo, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { DataTable } from '../../ui/DataTable'
import { UserStatus } from '../user-status'
import { UserRowContextMenu, type UserManaderTableProps } from './UserRowContextMenu'

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
      return displayRole[value as Role]
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
      return format(value, 'dd/MM/yyyy HH:mm')
    }
  }
]

export const UserManaderTable = memo(({ className }: UserManaderTableProps) => {
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

  const allAdmin = useAllAdmin()
  const allUser = useAllUsers()
  const allUserContractAddress = useQueries({
    queries: allUser.flat.map((add) => createUserContractQuery(add))
  })
  const allUserInfo = useQueries({
    queries: allUserContractAddress.map((item) => createUserInfoQuery(item.data ?? ''))
  })

  const isDisable = useQueries({
    queries: allUser.flat.map((add) => createIsUserDisabledQuery(add))
  })

  const userDisabledAt = useQueries({
    queries: allUser.flat.map((address) => createUserDisabledAtQuery(address))
  })

  const userRegisteredAt = useQueries({
    queries: allUser.flat.map((address) => createUserRegisteredAtQuery(address))
  })

  const allUserInfoData = allUserInfo.map((item) => item.data)

  const adminAppointedAt = useQueries({
    queries: allAdmin.flat.map((address) => createAdminExecutorAppointedAtQuery(address))
  })

  const allAdminData: User[] = allAdmin.flat.map((address, i) => ({
    address,
    lastUpdate: adminAppointedAt[i].data ?? Date.now(),
    name: `Admin_${address}`,
    role: Role.admin,
    status: Status.active
  }))

  const allUserData: User[] = allUser.flat.map((address, i) => ({
    address,
    lastUpdate: userDisabledAt[i].data ?? userRegisteredAt[i].data ?? Date.now(),
    name: allUserInfoData[i]?.firstName ?? '',
    role: Role.user,
    status: isDisable[i].data ? Status.inActive : Status.active
  }))

  const allData = [...allAdminData, ...allUserData]

  const displayData = allData.filter(
    (item) =>
      (role === 'all' ? true : item.role === role) &&
      (status === 'all' ? true : item.status === status) &&
      (!searchValue ? true : isMatch(item.address, searchValue) || isMatch(item.name, searchValue))
  )

  useEffect(() => {
    if (!allAdmin.hasNextPage || allAdmin.isFetchingNextPage) return
    void allAdmin.fetchNextPage()
  }, [allAdmin.hasNextPage, allAdmin.isFetchingNextPage, allAdmin.fetchNextPage])

  useEffect(() => {
    if (!allUser.hasNextPage || allUser.isFetchingNextPage) return
    void allUser.fetchNextPage()
  }, [allUser.hasNextPage, allUser.isFetchingNextPage, allUser.fetchNextPage])

  return (
    <div className={cn('mx-auto py-10 size-full overflow-hidden', className)}>
      <DataTable
        columns={columns}
        data={displayData}
        bodyRowWrapper={({ row, children }) => (
          <UserRowContextMenu row={row}>{children}</UserRowContextMenu>
        )}
      />
    </div>
  )
})
