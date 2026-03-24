import LoadingApp from '@/shared/components/loading-app'
import { withTimeout } from '@/shared/lib'
import { getPlatform } from '@metanodejs/system-core'
import { createContext, useEffect, useState, type PropsWithChildren } from 'react'

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

    await Promise.all([
      loadScript(`${base}/js/fileDbHelper.js`),
      loadScript(`${base}/js/exe_controller.js`),
      loadScript(`${base}/js/storage_controller.js`),
      loadScript(`${base}/js/file_controller.js`),
      loadScript(`${base}/js/finsdk.js`)
    ])

    loadCSS(`${base}/css/index.css`)
  }
}

export const FinSdkProvider = ({ children }: PropsWithChildren) => {
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

      if (!isDev) setLoading(false)
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

  return (
    <finSdkContext.Provider value={{}}>
      {loading ? <LoadingApp /> : children}
    </finSdkContext.Provider>
  )
}
