import { SearchInput } from '@/components/main/SearchInput'
import { RoleSelector } from '@/components/main/select/RoleSelector'
import { StatusSelector } from '@/components/main/select/StatusSelector'
import { AddAdmin } from '@/components/main/tabs/AddAdmin'
import { DisableUser } from '@/components/main/tabs/DisableUser'
import { TransferAdmin } from '@/components/main/tabs/TransferAdmin'
import { UserManaderTable } from '@/components/main/table/UserManaderTable'
import { ChooseWallet } from '@/components/wallet/ChooseWallet'
import { useRole } from '@/hooks/useRole'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

function RouteComponent() {
  const { isOwner } = useRole()

  return (
    <div className="size-full p-5 flex flex-col">
      {/* Header */}
      <div className="flex justify-between">
        <p className="font-bold text-xl">ADMIN DAPP CHAT</p>
        <ChooseWallet />
      </div>
      {/* table */}
      <div className="pt-10 flex flex-col flex-1">
        <p className="font-bold text-xl">Disable User (20)</p>
        <div className="flex flex-wrap gap-3 justify-between items-center pt-3">
          <div className="flex gap-3">
            {isOwner && (
              <>
                <AddAdmin />
                <TransferAdmin />
              </>
            )}
            <DisableUser />
          </div>
          <div className="flex gap-3">
            <StatusSelector />
            <RoleSelector />
            <SearchInput />
          </div>
        </div>
        <UserManaderTable className="flex-1" />
      </div>
    </div>
  )
}
