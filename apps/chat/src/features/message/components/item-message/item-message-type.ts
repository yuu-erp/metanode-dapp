import type { HTMLMotionProps } from 'framer-motion'

export interface MessageItemProps<T> extends Omit<HTMLMotionProps<'div'>, 'children'> {
  message: T
  isMine?: boolean
  onSelectMessage?: (message: T) => void
  layoutId?: string
}
