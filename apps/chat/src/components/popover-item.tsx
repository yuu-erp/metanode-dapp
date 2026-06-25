import { memo, type HTMLAttributes, type PropsWithChildren } from 'react'

export type PopoverItemProps = PropsWithChildren & HTMLAttributes<HTMLElement>

export const PopoverItem = memo(({ children, ...props }: PopoverItemProps) => {
  return (
    <div className="text-sm hover:bg-white/10 w-full p-1" {...props}>
      {children}
    </div>
  )
})
