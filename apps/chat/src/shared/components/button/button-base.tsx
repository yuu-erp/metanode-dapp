import React from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/shared/lib'

export interface ButtonBaseProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> {
  LeftIcon?: React.ComponentType<{ className: string }>
  RightIcon?: React.ComponentType<{ className: string }>
  iconClassName?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null) => void
  isLoading?: boolean
  variant?: keyof typeof variants
  isRounded?: boolean
}

const variants = {
  default: '',
  constrait: 'bg-surface-constrait text-text-primary',
  primary: 'bg-surface-secondary text-text-primary',
  normal: 'px-3 h-[42px] bg-white/20 rounded-xl border-app',
  icon: 'xl:size-[3rem] hidden size-[2.6rem] flex items-center justify-center rounded-full bg-black/20 shrink-0'
}

const ButtonBase = React.forwardRef<HTMLButtonElement, ButtonBaseProps>((props, ref) => {
  const {
    LeftIcon,
    RightIcon,
    iconClassName,
    onClick,
    isLoading,
    className,
    children,
    variant = 'default',
    isRounded,
    ...rest
  } = props

  const iconClass =
    !iconClassName?.includes('w-') || !iconClassName?.includes('h-')
      ? cn('w-6 h-6', iconClassName)
      : iconClassName

  return (
    <button
      ref={ref}
      className={cn(
        'flex items-center justify-center outline-none',
        variants[variant],
        className,
        isRounded && 'rounded-full',
        (LeftIcon || RightIcon) && 'gap-x-2'
      )}
      onClick={onClick}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? (
        <LoaderCircle className={cn(iconClass, 'animate-spin')} />
      ) : (
        <>
          {LeftIcon && <LeftIcon className={iconClass} />}
          {children && children}
          {RightIcon && <RightIcon className={iconClass} />}
        </>
      )}
    </button>
  )
})

ButtonBase.displayName = 'ButtonBase'
export default React.memo(ButtonBase)
