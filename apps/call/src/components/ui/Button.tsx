import { memo, type HTMLAttributes } from 'react'
import { cn } from '@/libs'
import { Loader2 } from 'lucide-react'

export type ButtonProp = HTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}

export const Button = memo(({ children, className, loading, ...props }: ButtonProp) => {
  return (
    <button className={cn('size-8 rounded-full', className)} {...props}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  )
})
