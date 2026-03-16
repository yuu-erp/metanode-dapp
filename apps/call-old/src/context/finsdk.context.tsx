import { createContext, useEffect, useState, type PropsWithChildren } from 'react'

interface FinsdkContextType {}

const FinsdkContext = createContext<FinsdkContextType | null>(null)

interface FinsdkProviderProps extends PropsWithChildren {}

const FinsdkProvider: React.FC<FinsdkProviderProps> = ({ children }) => {
  const [loadingSdk, _setLoadingSdk] = useState<boolean>(false)

  useEffect(() => {
    // // @ts-ignore
    // if (!window?.finSdk) return setLoadingSdk(false)
    // //@ts-ignore
    // window.finSdk.init({
    //   onProgress: (_percent: string) => {
    //     console.log('_percent', _percent)
    //   },
    //   onFinish: async () => {
    //     setLoadingSdk(false)
    //   },
    //   onError: (id: any) => console.error('window.finSdk.init', id)
    // })
  }, [])
  if (loadingSdk) return <p>Loading...</p>
  return <FinsdkContext.Provider value={{}}>{children}</FinsdkContext.Provider>
}

export { FinsdkProvider }
