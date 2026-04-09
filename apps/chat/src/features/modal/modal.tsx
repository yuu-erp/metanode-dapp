import { Dialog, DialogContent, DialogTrigger } from '@/shared/components/ui/dialog'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { type PropsWithChildren, type ReactNode } from 'react'
import { Drawer } from 'vaul'

export type ModalProps = PropsWithChildren & {
  trigger?: ReactNode
  content?: ReactNode
  open?: boolean
  onOpenChange?: (v: boolean) => void
}

export const Modal = ({ trigger, content, open, onOpenChange }: ModalProps) => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Root shouldScaleBackground open={open} onOpenChange={onOpenChange}>
        <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
            <div className="relative rounded-t-[36px] bg-black/30 backdrop-blur-md border border-white/10 flex flex-col overflow-hidden">
              <div className="w-full flex flex-col overflow-hidden">{content}</div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 bg-transparent border-none shadow-none text-white">
        <div className="relative h-min w-full rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 flex flex-col overflow-hidden">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
}
