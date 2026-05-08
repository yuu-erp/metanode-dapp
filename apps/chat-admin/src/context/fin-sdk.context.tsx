import { getPlatform } from '@metanodejs/system-core'
import { createContext, useEffect, useState, type PropsWithChildren, type ReactNode } from 'react'

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = 1000
): Promise<T | undefined> {
  return Promise.race([
    fn(),
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeoutMs))
  ])
}

export type FinSdkContext = {}

const finSdkContext = createContext<FinSdkContext>(null!)

function useLoadFinSdkScript() {
  function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve()
      }

      const s = document.createElement('script')
      s.src = src
      s.onload = () => resolve()
      s.onerror = reject

      document.head.appendChild(s)
    })
  }

  function loadCSS(href: string) {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }
  }

  return async function loadFinSdkAssets() {
    const base = 'https://a.ibe.app:8000/mtn-virtual-lib'

    await loadScript(`${base}/js/fileDbHelper.js`)
    await loadScript(`${base}/js/exe_controller.js`)
    await loadScript(`${base}/js/storage_controller.js`)
    await loadScript(`${base}/js/file_controller.js`)
    await loadScript(`${base}/js/ui_controller.js`)
    await loadScript(`${base}/js/sdk_bootstrap.js`)
    await loadScript(`${base}/js/finsdk.js`)

    loadCSS(`${base}/css/index.css`)
  }
}

export const FinSdkProvider = ({
  children,
  fallBack = null
}: PropsWithChildren & {
  fallBack?: ReactNode
}) => {
  const [loading, setLoading] = useState(true)
  const loadFinSdkScript = useLoadFinSdkScript()

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const platform = await withTimeout(getPlatform)

        return platform
      } catch {
        return undefined
      }
    }

    const initialize = async () => {
      const isDev = import.meta.env.DEV
      if (!isDev) return setLoading(false)
      const isWeb = !(await checkPlatform())

      if (!isWeb) return setLoading(false)
      await loadFinSdkScript()
      window.finSdk.init({
        onProgress: (_percent: string) => {
          console.log('_percent', _percent)
        },
        onFinish: async () => {
          setLoading(false)
        },
        onError: (id: any) => console.error('window.finSdk.init', id)
      })
    }

    initialize()
  }, [])

  return <finSdkContext.Provider value={{}}>{loading ? fallBack : children}</finSdkContext.Provider>
}
