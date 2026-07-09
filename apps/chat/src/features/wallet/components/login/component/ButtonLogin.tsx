import { cn } from '@/shared/lib'
import { ChevronRight } from 'lucide-react'
import { memo } from 'react'

interface ButtonLoginProps {
  className?: string
  Icon: any
  content: string
  onClick: (e: any) => void
}

const ButtonLogin = memo((props: ButtonLoginProps) => {
  const { className, Icon, content, onClick } = props

  return (
    <div
      className={cn(
        className,
        'flex h-[84px] w-full items-center justify-between rounded-3xl border-app px-3 hover:cursor-pointer bg-white/70 hover:bg-white'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-10 w-10 object-cover" />
        <span className="font-customBold text-[1rem]/[16.8px]">{content}</span>
      </div>
      <ChevronRight className="text-[1.5rem]" />
    </div>
  )
})

export default ButtonLogin
