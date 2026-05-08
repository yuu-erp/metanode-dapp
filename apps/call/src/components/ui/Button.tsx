import { memo, type HTMLAttributes } from 'react'
import { cn } from '@/libs'
import { Loader2 } from 'lucide-react'

export type ButtonProp = HTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}

export const Button = memo(({ children, className, loading, ...props }: ButtonProp) => {
  return (
    <button
      className={cn(
        'size-12 rounded-full flex items-center justify-center bg-black text-white',
        '[&>svg]:size-5',
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : children}
    </button>
  )
})
