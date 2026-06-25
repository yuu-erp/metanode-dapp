import LoadingApp from '@/shared/components/loading-app'
import { queryClient } from '@/shared/lib/react-query'
import { contractClient } from '@mtnts/contract-client'
import { getMyKeys, initChatModule } from 'chat-core'
import { useEffect, useState, type PropsWithChildren } from 'react'

export function AppModulesProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    ;(async () => {
      try {
        // setup module
        const client = queryClient as any
        initChatModule({ client })
        // setup flow
        const myKeys = getMyKeys()
        if (myKeys) {
          contractClient.setFrom(myKeys.hiddenAddress)
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <LoadingApp />
  return <>{children}</>
}
