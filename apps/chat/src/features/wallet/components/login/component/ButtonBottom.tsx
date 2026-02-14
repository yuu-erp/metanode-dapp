import { cn } from '@/shared/lib'
import { Loader, MoveLeft } from 'lucide-react'
import { memo } from 'react'

interface ButtonBottom {
  title: string
  className?: string
  onBack: () => void
  onNext: () => void
  isLoading?: boolean
}

const ButtonBottom = memo(({ title, className, onBack, onNext, isLoading }: ButtonBottom) => {
  return (
    <div className={cn('flex w-full gap-3', className)}>
      <button
        className="flex h-12 w-12 items-center justify-center rounded-full border-app hover:cursor-pointer"
        onClick={onBack}
      >
        <MoveLeft className="size-5" />
      </button>
      <button
        className="flex grow items-center justify-center rounded-[26px] border-app text-[1.125rem] uppercase text-white hover:cursor-pointer"
        onClick={onNext}
      >
        {isLoading ? <Loader className="size-6" /> : title}
      </button>
    </div>
  )
})

export default ButtonBottom
