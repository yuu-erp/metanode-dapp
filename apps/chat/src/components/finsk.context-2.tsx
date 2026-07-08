import LoadingApp from '@/shared/components/loading-app'
import { queryClient } from '@/shared/lib/react-query'
import { FiaiSDK } from '@metanodejs/fiai-sdk'
import { contractClient } from '@mtnts/contract-client'
import { initFileReact } from 'file-core'
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'

interface FinsdkContextType {
  loadingSdk: boolean
}

const FinsdkContext = createContext<FinsdkContextType | null>(null)

type FinsdkProvider2Props = PropsWithChildren

const FinsdkProvider2: React.FC<FinsdkProvider2Props> = ({ children }) => {
  const [loadingSdk, setLoadingSdk] = useState<boolean>(true)

  const handleIntSDK = async () => {
    try {
      const w = window as any
      if (
        !w.webkit?.messageHandlers?.callbackHandler?.postMessage &&
        !w?.electronAPI?.sendMessage &&
        import.meta.env.DEV
      ) {
        await FiaiSDK.init({})
      }
      contractClient.init()
      //@ts-ignore
      initFileReact({ client: queryClient })
    } finally {
      setLoadingSdk(false)
    }
  }

  useEffect(() => {
    handleIntSDK()
  }, [])

  if (loadingSdk) {
    return <LoadingApp />
  }
  return <FinsdkContext.Provider value={{ loadingSdk }}>{children}</FinsdkContext.Provider>
}

const useFinsdkContext = () => {
  const context = useContext(FinsdkContext)
  if (!context) throw new Error('useFinsdkContext must be used within FinsdkProvider2')
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export { FinsdkProvider2, useFinsdkContext }
