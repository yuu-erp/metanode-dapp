import { VoiceRecorder } from '@/components/voice-recorder'
import { container } from '@/container'
import { IncomingCall } from '@/features/call'
import { ConversationsProvider } from '@/features/conversation'
import { useMessageEvents } from '@/hooks/mesage/use-message-events'
import { useSyncCall } from '@/hooks/sync/use-sync-call'
import { useSyncAccount } from '@/new/me/use-sync-account'
import { useMarkAsReadv2 } from '@/new/message/mark-as-read'
import { BackgroundSyncProvider } from '@/shared/background-sync'
import { AppSidebar } from '@/shared/components/partials/app-sidebar'
import NavbarMenu from '@/shared/components/partials/navbar-menu'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { createCurrentAccountQueryOptions, useTitleNotification } from '@/shared/hooks'
import { useForcedLogout, useRegisterEventLog, useReloadOnNative } from '@/shared/hooks/accounts'
import { useDisabled } from '@/shared/hooks/accounts/use-disabled'
import { useSyncContractsAddressess } from '@/shared/hooks/accounts/use-sync-contracts-addressess'
import { queryClient } from '@/shared/lib/react-query'
import { statusActions, useStatusStore } from '@app/call'
import { Outlet, createFileRoute, redirect, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated')({
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
  // useConversationList()
  const syncCall = useSyncCall()

  useEffect(() => {
    container.eventLogContainer.eventLog.onEventLog((e) => {
      console.log('all all event', e)
    })

    const { id, type, status, from, to } = useStatusStore.getState()
    console.log('[RouteComponent] useEffect', { id, type, status, from, to })
    const duration = Math.max(Math.floor((to - from) / 1000), 0)

    syncCall(id, type, { callStatus: status, duration }).then(() => statusActions.resetCallData())
  }, [])

  useSyncAccount()

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
