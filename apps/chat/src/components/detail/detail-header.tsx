import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { memo } from 'react'

export type DetailHeaderProps = { isEdit: boolean; setIsEdit: (value: boolean) => void }

export const DetailHeader = memo(({ isEdit, setIsEdit }: DetailHeaderProps) => {
  const { history } = useRouter()

  return (
    <div className="p-3 flex justify-between items-center relative">
      <div className="flex items-center gap-3" onClick={() => history.back()}>
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
  )
})
