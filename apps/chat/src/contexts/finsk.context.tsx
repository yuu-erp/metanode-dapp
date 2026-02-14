import LoadingApp from '@/shared/components/loading-app'
import { createContext, useEffect, useState, type PropsWithChildren } from 'react'

interface FinsdkContextType {}

const FinsdkContext = createContext<FinsdkContextType | null>(null)

interface FinsdkProviderProps extends PropsWithChildren {}

const FinsdkProvider: React.FC<FinsdkProviderProps> = ({ children }) => {
  const [loadingSdk, setLoadingSdk] = useState<boolean>(true)

  useEffect(() => {
    //@ts-ignore
    if (!window.finSdk) {
      setLoadingSdk(false)
      return
    }
    //@ts-ignore
    window.finSdk.init({
      onProgress: (_percent: string) => {
        console.log('_percent', _percent)
      },
      onFinish: async () => {
        setLoadingSdk(false)
      },
      onError: (id: any) => console.error('window.finSdk.init', id)
    })
  }, [])
  if (loadingSdk) return <LoadingApp />
  return <FinsdkContext.Provider value={{}}>{children}</FinsdkContext.Provider>
}

export { FinsdkProvider }
