import { PinIcon } from '@/shared/components/icons'
import { cn } from '@/shared/lib'
import { BellOff, Reply, Trash } from 'lucide-react'

export function ConversationActions() {
  return (
    <div className="flex items-center justify-around border-t border-white/10 px-3 py-2">
      <Action icon={<Reply size={18} />} label="Reply" />
      <Action icon={<PinIcon className="size-4" />} label="Pin" />
      <Action icon={<BellOff size={18} />} label="Mute" />
      <Action icon={<Trash size={18} />} label="Delete" danger />
    </div>
  )
}

function Action({
  icon,
  label,
  danger
}: {
  icon: React.ReactNode
  label: string
  danger?: boolean
}) {
  return (
    <button
      className={cn(
        'flex flex-col items-center gap-1 text-xs',
        danger ? 'text-red-500' : 'text-white/80'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
