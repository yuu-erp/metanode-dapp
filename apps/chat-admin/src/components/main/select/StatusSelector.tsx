import { Status } from '@/@types/enum'
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
          <SelectItem value={Status.active}>Active</SelectItem>
          <SelectItem value={Status.inActive}>InActive</SelectItem>
        </SelectContent>
      </Select>
    </SelectWrapper>
  )
})
