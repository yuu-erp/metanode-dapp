import { cn } from '@/lib'
import { memo, type InputHTMLAttributes, type ReactNode } from 'react'

export type inputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  leftNode?: ReactNode
  rightNode?: ReactNode
  classNames?: {
    wrapper?: string
    input?: string
  }
}

export const Input = memo(({ classNames, leftNode, rightNode, ...props }: inputProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-secondary h-10 px-3 rounded-lg',
        classNames?.wrapper
      )}
    >
      {leftNode}
      <input
        className={cn('bg-transparent focus:outline-none flex-1 size-full', classNames?.input)}
        {...props}
      />
      {rightNode}
    </div>
  )
})
