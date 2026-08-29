'use client'
import { useFetchContractInfo } from '@/hooks'
import { useGetAllWallets } from '@/hooks'
import { cn } from '@/lib/utils'
import { connectNode } from '@metanodejs/system-core'
import { AlertCircle, RefreshCw } from 'lucide-react'
import * as React from 'react'

export interface ConnectNodeState {
  isConnected: boolean
  error: string | null
  isLoading: boolean
  retryCount: number
  canRetry: boolean
}

const ConnectNodeContext = React.createContext<ConnectNodeState | undefined>(undefined)

const LOADING_TIMEOUT_MS = 5000

function ConnectingOverlay({ onTimeout }: Readonly<{ onTimeout: () => void }>) {
  React.useEffect(() => {
    const timer = window.setTimeout(onTimeout, LOADING_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [onTimeout])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#060b1a]/70 backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-6 px-6">
        <div className="relative size-24">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.4),rgba(167,139,250,0.2),transparent_70%)] blur-md" />
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-violet-400" />
          <div className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-b-violet-400/80 [animation-direction:reverse] [animation-duration:1.6s]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-3 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.95)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

type ConnectNodeProviderProps = React.PropsWithChildren

export function ConnectNodeProvider({ children }: Readonly<ConnectNodeProviderProps>) {
  const { data: contractInfo } = useFetchContractInfo()
  const { data: wallets } = useGetAllWallets()

  const [state, setState] = React.useState<ConnectNodeState>({
    isConnected: false,
    error: null,
    isLoading: true,
    retryCount: 0,
    canRetry: true,
  })

  const MAX_RETRIES = 5
  const BASE_DELAY = 1500 // ms

  const allowLoadingRef = React.useRef(true)

  const getDelay = (attempt: number) => {
    // Exponential backoff + jitter (recommended by AWS/Google best practices)
    const exponential = BASE_DELAY * Math.pow(2, attempt)
    const jitter = Math.random() * 400 // random ±200ms to prevent thundering herd
    return Math.min(exponential + jitter, 30000) // cap at 30 seconds max
  }

  const connect = React.useCallback(async () => {
    if (!contractInfo?.ip || !contractInfo?.port) {
      setState((s) => ({
        ...s,
        error: 'Missing node information (IP/Port)',
        isLoading: false,
        canRetry: false,
      }))
      return
    }

    if (!wallets?.length) {
      setState((s) => ({ ...s, error: 'No wallets found', isLoading: false, canRetry: false }))
      return
    }

    setState((s) => ({
      ...s,
      isLoading: allowLoadingRef.current,
      error: null,
    }))

    try {
      console.warn('KHAIHOAN DEBUG CONNECT NODE: ', {
        wallets,
        node: {
          ip: contractInfo.ip,
          port: contractInfo.port,
        },
      })
      await connectNode({
        wallets,
        node: {
          ip: contractInfo.ip,
          port: contractInfo.port,
        },
      })

      setState({
        isConnected: true,
        error: null,
        isLoading: false,
        retryCount: 0,
        canRetry: true,
      })
    } catch (err) {
      console.error('Failed to connect to node:', err)

      const newRetryCount = state.retryCount + 1

      if (newRetryCount >= MAX_RETRIES) {
        setState({
          isConnected: false,
          error:
            'Failed to connect after multiple attempts. Please check your network or node status.',
          isLoading: false,
          retryCount: newRetryCount,
          canRetry: true, // allow manual retry
        })
        return
      }

      const delay = getDelay(newRetryCount)
      const seconds = Math.round(delay / 1000)

      setState({
        isConnected: false,
        error: `Connection failed... Retrying in ${seconds}s (attempt ${newRetryCount}/${MAX_RETRIES})`,
        isLoading: false,
        retryCount: newRetryCount,
        canRetry: false,
      })

      // Schedule automatic retry
      const timer = setTimeout(() => {
        void connect()
      }, delay)

      // Cleanup on unmount or deps change
      return () => clearTimeout(timer)
    }
  }, [contractInfo?.ip, contractInfo?.port, wallets?.length, state.retryCount])

  React.useEffect(() => {
    if (contractInfo && wallets && state.canRetry) {
      void connect()
    }
  }, [connect, contractInfo, wallets, state.canRetry])

  const handleLoadingTimeout = React.useCallback(() => {
    allowLoadingRef.current = false
    setState((s) => (s.isConnected || !s.isLoading ? s : { ...s, isLoading: false }))
  }, [])

  const handleManualRetry = () => {
    allowLoadingRef.current = true
    setState((s) => ({
      ...s,
      retryCount: 0,
      canRetry: true,
      error: null,
      isLoading: true,
    }))
  }

  const value = React.useMemo(() => state, [state])

  return (
    <ConnectNodeContext value={value}>
      {state.isLoading && <ConnectingOverlay onTimeout={handleLoadingTimeout} />}

      {state.error && !state.isLoading && (
        <div
          className={cn(
            'fixed left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-sm text-red-800 flex items-center gap-2 shadow-md z-50 max-w-[360px] w-full',
            window.isHasNotch ? 'top-14' : 'top-10',
          )}
        >
          <AlertCircle className="size-4" />
          <span className="flex-1">{state.error}</span>

          {state.canRetry && (
            <button
              onClick={handleManualRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 font-medium transition-colors"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {children}
    </ConnectNodeContext>
  )
}

export function useConnectNode() {
  const context = React.use(ConnectNodeContext)
  if (context === undefined) {
    throw new Error('useConnectNode must be used within a ConnectNodeProvider')
  }
  return context
}
