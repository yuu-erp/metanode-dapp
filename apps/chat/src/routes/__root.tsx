import { LeaveGroupDialog } from '@/components/leave-group-dialog'
import { DiscardRecordingModal } from '@/components/modal/discard-recording-modal'
import { WindowButtons } from '@/components/window-buttons'
import { container } from '@/container'
import { EventLogProvider } from '@/contexts'
import { MeetingJoinByUrlModal } from '@/features/modal/meeting-join-by-url-modal'
import { MeetingUrlModal } from '@/features/modal/meeting-url-modal'
import { addConversation } from '@/new/conversation/list-conversation'
import { DrawerAddGroupMember } from '@/shared/components'
import { BaseLayout } from '@/shared/layouts'
import { createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
console.log('APP CHAT V - 1.0.1 =====>')

export const Route = createRootRoute({
  component: () => {
    useEffect(() => {
      const off = container.eventLogContainer.eventLog.onEventLog((e) => {
        console.log('[DEBUG13/06] ALL EVENT LOG', e)
      })

      return () => {
        off()
      }
    }, [])

    return (
      <>
        <button className="right-0 top-0 fixed z-50 bg-black size-20" onClick={async () => {}} />
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
