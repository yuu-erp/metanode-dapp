'use client'
import { EditIcon } from '@/shared/components/icons'
import { QrCode, X } from 'lucide-react'
import * as React from 'react'
import { Drawer } from 'vaul'
import { useScanQrcodeProfile } from '../hooks'
import { useCurrentAccount } from '@/shared/hooks'

function DrawerNewConversation() {
  const { data: account } = useCurrentAccount()
  const { mutate } = useScanQrcodeProfile()

  const handleClickScanQR = React.useCallback(() => {
    if (!account) return
    mutate(account)
  }, [account])
  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        <button>
          <EditIcon className="size-7" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 outline-none">
          <div className="bg-gray-100 rounded-t-[42px] overflow-hidden flex flex-col h-[90vh] p-3">
            <div className="max-w-md mx-auto w-full">
              <div className="w-full relative flex items-center">
                <Drawer.Close asChild className="outline-none">
                  <button className="size-10 bg-white shadow-2xl rounded-full flex items-center justify-center">
                    <X className="size-6 text-black" />
                  </button>
                </Drawer.Close>
                <Drawer.Title className="font-medium mb-4 text-md text-gray-900 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  New Message
                </Drawer.Title>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Search address or username"
                  className="
    flex-1 h-12 rounded-full px-4 text-sm
    bg-white text-gray-900
    placeholder:text-gray-500
    outline-none
    focus:bg-gray-100
    focus:ring-2 focus:ring-black/10
  "
                  style={{
                    boxShadow: `2px 2px 6px 0px #0000004D inset`
                  }}
                />
                <button
                  type="button"
                  className="size-12 shrink-0 rounded-full bg-white shadow-md flex items-center justify-center"
                  style={{
                    boxShadow: `2px 2px 6px 0px #0000004D inset`
                  }}
                  onClick={handleClickScanQR}
                >
                  <QrCode className="size-6 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default React.memo(DrawerNewConversation)
