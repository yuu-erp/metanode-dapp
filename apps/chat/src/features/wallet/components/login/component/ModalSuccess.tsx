import { ArrowBigLeft, Bomb } from 'lucide-react'
import { memo } from 'react'

interface ModalSuccessProps {
  onClose: () => void
  isImport?: boolean
}

const ModalSuccess = memo(({ onClose, isImport }: ModalSuccessProps) => {
  return (
    <div className="fixed -left-5 -top-5 z-50 flex h-[110%] w-[114%] items-center justify-center bg-white/[.64] shadow-card-feature backdrop-blur-sm">
      <div className="relative flex w-[90%] flex-col items-center gap-3 rounded-3xl bg-white/80 py-10">
        <Bomb className="h-[120px] w-[120px]" />
        <span className="font-customBold text-[18px]/[22px] text-[#1E1B39]">
          noti.success.success!
        </span>
        <span className="text-[1rem]/[1.625rem] text-[#1E1B39]/[.68]">
          noti.success.import-success!
        </span>
        <ArrowBigLeft className="absolute right-5 top-5 h-4 w-4" onClick={onClose} />
      </div>
    </div>
  )
})

export default ModalSuccess
