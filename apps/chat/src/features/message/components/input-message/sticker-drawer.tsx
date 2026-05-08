'use client'

import { STICKERS } from '@/constants/stickers'
import { cn } from '@/shared/lib'
import { Archive } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'

interface StickerDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendSticker: (stickerId: string) => void
}

export function StickerDrawer({ open, onOpenChange, onSendSticker }: StickerDrawerProps) {
  const [selectedPackId, setSelectedPackId] = React.useState<string>(STICKERS[0]?.id || '')
  const isMobile = useIsMobile()

  const selectedPack = React.useMemo(
    () => STICKERS.find((s) => s.id === selectedPackId),
    [selectedPackId]
  )

  const handleSendSticker = (stickerId: string) => {
    onSendSticker(stickerId)
    onOpenChange(false)
  }

  const renderContent = (
    <div className="bg-black/60 backdrop-blur-md-app rounded-t-4xl md:rounded-2xl flex flex-col h-[400px] border-t md:border border-white/10 w-full overflow-hidden">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          {/* Recent / Favorites placeholder (optional) */}
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Archive className="size-6 text-gray-400" />
          </button>

          {STICKERS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setSelectedPackId(pack.id)}
              className={cn(
                'relative p-1 rounded-lg transition-all',
                selectedPackId === pack.id ? 'bg-white/10' : 'hover:bg-white/5'
              )}
            >
              {/* Try to show usage of first sticker as icon or use a generic icon if packs don't have icons */}
              {/* Assuming packs don't have separate icon property, using first sticker as preview */}
              {pack.stickers[0] ? (
                <img
                  src={pack.stickers[0].image}
                  alt={pack.name}
                  className="size-8 object-contain rounded-lg"
                />
              ) : (
                <span className="text-white text-xs">{pack.name}</span>
              )}
            </button>
          ))}
        </div>

        {/* Close Button (optional since it's a drawer but good for UX) */}
        {/* <button onClick={() => onOpenChange(false)} className="p-2">
                 <X className="size-5 text-gray-400" />
               </button> */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="sr-only">
          <Drawer.Title>Sticker Selection</Drawer.Title>
        </div>
        {selectedPack ? (
          <div className="grid grid-cols-4 gap-4">
            {selectedPack.stickers.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleSendSticker(sticker.id)}
                className="aspect-square flex items-center justify-center hover:bg-white/5 rounded-2xl transition-colors overflow-hidden"
              >
                <img
                  src={sticker.image}
                  alt="sticker"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No stickers found
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 outline-none flex flex-col">
            {renderContent}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-transparent border-none shadow-none text-white">
        {renderContent}
      </DialogContent>
    </Dialog>
  )
}
