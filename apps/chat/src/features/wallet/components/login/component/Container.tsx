import { cn } from '@/shared/lib'
import { memo, type ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
}

const Container = memo(({ children, className }: ContainerProps) => {
  return <div className={cn(className, 'w-full grow')}>{children}</div>
})

export default Container
