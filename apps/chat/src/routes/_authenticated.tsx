import { VoiceRecorder } from '@/components/voice-recorder'
import { container } from '@/container'
import { IncomingCall } from '@/features/call'
import { ConversationsProvider } from '@/features/conversation'
import { useGroupEvent } from '@/hooks/group/use-group-event'
import { useMessageEvents } from '@/hooks/mesage/use-message-events'
import { useSyncCall } from '@/hooks/sync/use-sync-call'
import { useMarkAsReadv2 } from '@/new/message/mark-as-read'
import { BackgroundSyncProvider } from '@/shared/background-sync'
import { AppSidebar } from '@/shared/components/partials/app-sidebar'
import NavbarMenu from '@/shared/components/partials/navbar-menu'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import {
  createCurrentAccountQueryOptions,
  getCurrentAccount,
  useTitleNotification
} from '@/shared/hooks'
import { useForcedLogout, useRegisterEventLog, useReloadOnNative } from '@/shared/hooks/accounts'
import { useDisabled } from '@/shared/hooks/accounts/use-disabled'
import { useSyncContractsAddressess } from '@/shared/hooks/accounts/use-sync-contracts-addressess'
import { queryClient } from '@/shared/lib/react-query'
import { Outlet, createFileRoute, redirect, useRouterState } from '@tanstack/react-router'
import { getState, reset } from 'call-core'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { contractClient } from '@mtnts/contract-client'
import { SystemCore } from '@metanodejs/system-core'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    try {
      const account = await getCurrentAccount()
      console.log('setfrommmsetfrommm =======> 1', account.hiddenAddress)
      console.log('setfrommmsetfrommm =======> 2', {
        froms: contractClient.froms,
        me: contractClient.methods
      })

      contractClient.setFrom(account.hiddenAddress)
      console.log('setfrommmsetfrommm =======> 3', contractClient.froms)
    } catch (error) {}
  },
  loader: async () => {
    try {
      const currentAccount = await queryClient.ensureQueryData(createCurrentAccountQueryOptions())

      if (!currentAccount || !currentAccount.isActive) {
        throw redirect({ to: '/wallets' })
      }
      const isUserDisabled = await container.factoryContract.isUserDisabled({
        from: currentAccount.address,
        inputData: { user: currentAccount?.address }
      })

      if (isUserDisabled) {
        container.accountService.logout()
        toast.error('User is disabled')
        throw redirect({ to: '/wallets' })
      }

      return {}
    } catch (error) {
      console.error(error)
      throw redirect({ to: '/wallets' })
    }
  },
  component: RouteComponent
})

const noNavbarRoutes = [/^\/p2p\/[^/]+$/, /^\/group\/[^/]+$/, /^\/anonymous_group\/[^/]+$/]

function RouteComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showNavbar = !noNavbarRoutes.some((regex) => regex.test(pathname))

  useTitleNotification()
  useForcedLogout()
  useRegisterEventLog()
  useReloadOnNative()
  useSyncContractsAddressess()
  useDisabled()
  useMessageEvents()
  useMarkAsReadv2()
  useGroupEvent()
  // useConversationList()
  const syncCall = useSyncCall()

  useEffect(() => {
    container.eventLogContainer.eventLog.onEventLog((e) => {
      console.log('all all event', e)
    })
    ;(async () => {
      const rs = await getState()
      console.log('thanhduy test sync call', { rs })
      if (!rs) return
      const { metadata, duration, kind } = rs
      reset()
      await syncCall(metadata, { callStatus: kind, duration })
    })()
  }, [])

  useEffect(() => {
    SystemCore.on('EventLogs', (e) => {
      console.log('on event data', e)
    })
  }, [])

  return (
    <ConversationsProvider>
      <div className="flex flex-row h-dvh w-dvw overflow-hidden">
        <IncomingCall />
        <BackgroundSyncProvider>
          <SidebarProvider
            style={
              {
                '--sidebar-width': '24rem',
                '--sidebar-background': 'transparent'
              } as React.CSSProperties
            }
          >
            <AppSidebar />
            <SidebarInset className="bg-transparent">
              <div className="flex-1 flex flex-col min-w-0 relative">
                <Outlet />
                {showNavbar && <NavbarMenu />}
                <VoiceRecorder />
              </div>
            </SidebarInset>
          </SidebarProvider>
        </BackgroundSyncProvider>
      </div>
    </ConversationsProvider>
  )
}
