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
        className="flex h-12 w-12 items-center justify-center rounded-full hover:cursor-pointer bg-white/70 hover:bg-white"
        onClick={onBack}
      >
        <MoveLeft className="size-5" />
      </button>
      <button
        className="flex grow items-center justify-center rounded-[26px] text-[1.125rem] uppercase hover:cursor-pointer bg-white/70 hover:bg-white"
        onClick={onNext}
      >
        {isLoading ? <Loader className="size-6" /> : title}
      </button>
    </div>
  )
})

export default ButtonBottom
