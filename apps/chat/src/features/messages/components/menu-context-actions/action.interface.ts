import type { DropdownMenuItem } from '@radix-ui/react-dropdown-menu'

export interface ActionProps extends React.ComponentProps<typeof DropdownMenuItem> {
  onClose?: () => void
}
