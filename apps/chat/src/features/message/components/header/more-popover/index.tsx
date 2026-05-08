import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { memo, useState, type PropsWithChildren } from 'react'
import { AddMemberButton } from './add-member-button'
import { DeleteGroupButton } from './delete-group-button'
import { LeaveGroupButton } from './leave-group-button'

export type MorePopoverProps = PropsWithChildren & {}

export const MorePopover = memo(({ children }: MorePopoverProps) => {
  const [open, setOpen] = useState(false)

  const closePopover = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="gap-2 flex flex-col">
        <AddMemberButton onClose={closePopover} />
        <DeleteGroupButton />
        <LeaveGroupButton onClose={closePopover} />
      </PopoverContent>
    </Popover>
  )
})
