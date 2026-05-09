import { SelectWrapper } from '@/components/ui/SelectWrapper'
import { memo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { uiActions, useUiStore } from '@/stores/ui.store'

export type StatusSelectorProps = {}

export const StatusSelector = memo(({}: StatusSelectorProps) => {
  const status = useUiStore((s) => s.status)

  return (
    <SelectWrapper label="Status">
      <Select value={status} onValueChange={uiActions.setStatus}>
        <SelectTrigger className="rounded-full">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inActive">InActive</SelectItem>
        </SelectContent>
      </Select>
    </SelectWrapper>
  )
})
