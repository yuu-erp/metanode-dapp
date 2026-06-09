import { cn } from '@/shared/lib'
import { memo, type ReactNode } from 'react'

export type BaseOverlayItemProps = {
  text?: string
  icon?: ReactNode
  className?: string
  onClick?: () => void
  hasSeparator?: boolean
}

export const BaseOverlayItem = memo(
  ({ text, icon, className, onClick, hasSeparator = true }: BaseOverlayItemProps) => {
    return (
      <>
        {hasSeparator && <div className="bg-black/10 -mx-1 my-1 h-px" />}
        <div
          onClick={onClick}
          className={cn(
            'flex p-2 gap-3 w-full justify-between [&_svg]:size-5 text-black',
            className
          )}
        >
          <p>{text}</p>
          {icon}
        </div>
      </>
    )
  }
)
