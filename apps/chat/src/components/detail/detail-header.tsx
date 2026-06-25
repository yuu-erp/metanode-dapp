import { usePlatform } from '@/hooks/core/use-platform'
import { cn } from '@/shared/lib'
import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { memo } from 'react'

export type DetailHeaderProps = { isEdit: boolean; setIsEdit: (value: boolean) => void }

export const DetailHeader = memo(({ isEdit, setIsEdit }: DetailHeaderProps) => {
  const { history } = useRouter()
  const { isWindow, isMobile } = usePlatform()

  return (
    <div className={cn('w-full ', isWindow && 'pt-10', isMobile && 'pt-5')}>
      <div className="relative w-full flex items-center gap-3 justify-between pr-5">
        <div
          className="p-3 flex justify-between items-center relative"
          onClick={() => history.back()}
        >
          <ChevronLeft className="size-4" />
          <p className="text-sm">Back</p>
        </div>
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold">
          Info
        </p>
        <p onClick={() => setIsEdit(!isEdit)} className="text-sm">
          {isEdit ? 'Done' : 'Edit'}
        </p>
      </div>
    </div>
  )
})
