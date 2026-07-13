import { useDeleteMessage, useMessageAction } from '@/features/message'
import { useCurrentState } from '@/hooks/use-current-state'
import { useMessageById } from '@/new/message'
import { useName } from '@/new/user/user-info'
import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog'
import { formatMessageTime } from '@/shared/helpers/date-fns'
import { useCurrentAccount } from '@/shared/hooks'
import { downloadFromServerEndToEnd, useCache } from 'file-core'
import { Download, Forward, Trash, X, ZoomIn, ZoomOut } from 'lucide-react'
import { memo, useEffect, useState, type ReactNode } from 'react'

export type ViewImageModalProps = {
  fileId: string
  children: ReactNode
  messageId: string
}

export const ViewImageModal = memo(({ children, fileId, messageId }: ViewImageModalProps) => {
  const { cache } = useCache(fileId)
  const { base } = useCurrentState()
  const { data } = useMessageById(messageId, base)
  const { name } = useName(data?.sender)
  const [open, setOpen] = useState(false)
  const { mutate } = useDeleteMessage()
  const { setMessageAction } = useMessageAction()
  const { account } = useCurrentAccount()
  const [scale, setScale] = useState(1)

  const btns = [
    {
      Icon: Trash,
      onClick: () => {
        mutate(data)
        setOpen(false)
      },
      isHidden: !data?.isMine
    },
    {
      Icon: Forward,
      onClick: () => {
        if (!data) return
        setOpen(false)
        setMessageAction({
          messageId: data.id,
          type: 'FORWARD'
        })
      }
    },
    {
      Icon: Download,
      onClick: () => {
        downloadFromServerEndToEnd(fileId, account?.address ?? '')
      }
    },
    {
      Icon: ZoomOut,
      onClick: () => setScale((s) => Math.max(s - 0.2, 0.4)),
      isHidden: cache?.previewType === 'video'
    },
    {
      Icon: ZoomIn,
      onClick: () => setScale((s) => Math.min(s + 0.2, 2)),
      isHidden: cache?.previewType === 'video'
    },
    {
      Icon: X,
      onClick: () => {
        setOpen(false)
      }
    }
  ]

  useEffect(() => {
    if (open) setScale(1)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-transparent shadow-none size-full max-w-full! flex justify-center items-center">
        <div className="fixed z-50 text-white left-4 top-4">
          <p className="font-bold">{name}</p>
          <p className="text-sm">{formatMessageTime(data?.timestamp)}</p>
        </div>

        <div className="fixed z-50 text-white right-4 top-4 flex gap-5">
          {btns.map((btn, i) =>
            btn.isHidden ? null : (
              <button key={i} onClick={() => btn.onClick?.()}>
                <btn.Icon />
              </button>
            )
          )}
        </div>

        {cache?.previewType === 'image' && (
          <img
            style={{
              scale
            }}
            src={cache?.previewPath || undefined}
          />
        )}
        {cache?.previewType === 'video' && (
          <video autoPlay controls src={cache?.previewPath || undefined} />
        )}
      </DialogContent>
    </Dialog>
  )
})
