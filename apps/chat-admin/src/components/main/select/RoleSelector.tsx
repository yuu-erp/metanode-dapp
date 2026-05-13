import { Role } from '@/@types/enum'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SelectWrapper } from '@/components/ui/SelectWrapper'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { memo } from 'react'

export type RoleSelectorProps = {}

export const RoleSelector = memo(({}: RoleSelectorProps) => {
  const role = useUiStore((s) => s.role)

  return (
    <SelectWrapper label="Role">
      <Select onValueChange={uiActions.setRole} value={role}>
        <SelectTrigger className="rounded-full">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value={Role.admin}>Admin</SelectItem>
          <SelectItem value={Role.user}>User</SelectItem>
        </SelectContent>
      </Select>
    </SelectWrapper>
  )
})
