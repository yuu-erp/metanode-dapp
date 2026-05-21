import { LeaveGroupDialog } from '@/components/leave-group-dialog'
import { DiscardRecordingModal } from '@/components/modal/discard-recording-modal'
import { WindowButtons } from '@/components/window-buttons'
import { EventLogProvider } from '@/contexts'
import { MeetingJoinByUrlModal } from '@/features/modal/meeting-join-by-url-modal'
import { MeetingUrlModal } from '@/features/modal/meeting-url-modal'
import { DrawerAddGroupMember } from '@/shared/components'
import { BaseLayout } from '@/shared/layouts'
import { SystemCore } from '@metanodejs/system-core'
import { createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
console.log('APP CHAT V - 1.0 =====>')

export const Route = createRootRoute({
  component: () => {
    useEffect(() => {
      const cb = (e: any) => {
        console.log('app chat log event log: ', e)
      }

      SystemCore.on('EventLogs', cb)
      return () => SystemCore.removeEventListener('EventLogs', cb)
    }, [])

    return (
      <>
        {/* <button
          className="fixed z-50 left-5 top-5 size-20 bg-black"
          onClick={async () => {
            try {
              console.log('click')

              const rootWallet = 'cf47697bae5c7da470ae3d6f7cb5aeee48f4d61e' //tablet
              // const rootWallet = 'e344be071d8102fb5b3c41d253ab79e9a1a9c201' //phone

              // const newAddress = (await createWalletFast(true)).address
              const newAddress = '0e9f9af3c4d44b77d51f8e5b03d5481ed7c3a73d'

              // const newAddress = (await getHiddenWallet()).address
              await sendTransaction({ from: rootWallet, to: newAddress, value: 1 + '0'.repeat(14) })
              toast.success('create success')
            } catch (error) {
              console.error(' send transaction error ', error)
            }
          }}
        ></button> */}
        {/* <Test /> */}
        <DiscardRecordingModal />
        <WindowButtons />
        <LeaveGroupDialog />
        <DrawerAddGroupMember />
        <MeetingJoinByUrlModal />
        <MeetingUrlModal />
        <EventLogProvider>
          <BaseLayout />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              classNames: { toast: window.isHasNotch ? 'mt-12' : 'mt-8' },
              style: {
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }
            }}
          />
        </EventLogProvider>
        {/* <div
          className="fixed right-0 top-0 z-100 bg-black size-20"
          onClick={async () => {
            const wallets = await getAllWallets()
            wallets.forEach((w) => {
              deleteWalletByAddress(w.address)
            })
          }}
        ></div> */}
      </>
    )
  }
})
