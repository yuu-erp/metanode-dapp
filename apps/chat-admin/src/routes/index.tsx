import { AppLoading } from '#/components/AppLoading'
import { FinSdkProvider } from '#/context/fin-sdk.context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="w-dvw h-dvh">
      <FinSdkProvider fallBack={<AppLoading />}>a</FinSdkProvider>
    </div>
  )
}
