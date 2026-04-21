'use client'
import { useFetchContractInfo } from '@/hooks'
import { useGetAllWallets } from '@/hooks'
import { cn } from '@/lib/utils'
import { connectNode } from '@metanodejs/system-core'
import { LoaderCircle, AlertCircle, RefreshCw } from 'lucide-react'
import * as React from 'react'

export interface ConnectNodeState {
  isConnected: boolean
  error: string | null
  isLoading: boolean
  retryCount: number
  canRetry: boolean
}

const ConnectNodeContext = React.createContext<ConnectNodeState | undefined>(undefined)

interface ConnectNodeProviderProps extends React.PropsWithChildren {}

export function ConnectNodeProvider({ children }: ConnectNodeProviderProps) {
  const { data: contractInfo } = useFetchContractInfo()
  const { data: wallets } = useGetAllWallets()

  const [state, setState] = React.useState<ConnectNodeState>({
    isConnected: false,
    error: null,
    isLoading: true,
    retryCount: 0,
    canRetry: true
  })

  const MAX_RETRIES = 5
  const BASE_DELAY = 1500 // ms

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
        canRetry: false
      }))
      return
    }

    if (!wallets?.length) {
      setState((s) => ({ ...s, error: 'No wallets found', isLoading: false, canRetry: false }))
      return
    }

    setState((s) => ({ ...s, isLoading: true, error: null }))

    try {
      console.log('KHAIHOAN DEBUG CONNECT NODE: ', {
        wallets,
        node: {
          ip: contractInfo.ip,
          port: contractInfo.port
        }
      })
      await connectNode({
        wallets,
        node: {
          ip: contractInfo.ip,
          port: contractInfo.port
        }
      })

      setState({
        isConnected: true,
        error: null,
        isLoading: false,
        retryCount: 0,
        canRetry: true
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
          canRetry: true // allow manual retry
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
        canRetry: false
      })

      // Schedule automatic retry
      const timer = setTimeout(() => {
        connect()
      }, delay)

      // Cleanup on unmount or deps change
      return () => clearTimeout(timer)
    }
  }, [contractInfo?.ip, contractInfo?.port, wallets?.length, state.retryCount])

  React.useEffect(() => {
    if (contractInfo && wallets && state.canRetry) {
      connect()
    }
  }, [connect, contractInfo, wallets, state.canRetry])

  const handleManualRetry = () => {
    setState((s) => ({ ...s, retryCount: 0, canRetry: true, error: null }))
  }

  const value = React.useMemo(() => state, [state])

  console.log({ state })

  return (
    <ConnectNodeContext.Provider value={value}>
      {state.isLoading && (
        <div
          className={cn(
            'fixed left-1/2 -translate-x-1/2 bg-white/90 px-3 py-2 text-black rounded-full text-sm font-medium shadow-lg flex items-center gap-2 z-50 backdrop-blur-sm',
            window.isHasNotch ? 'top-14' : 'top-10'
          )}
        >
          <LoaderCircle className="size-4 animate-spin" />
          <span>Connecting to node...</span>
        </div>
      )}

      {state.error && !state.isLoading && (
        <div
          className={cn(
            'fixed left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-sm text-red-800 flex items-center gap-2 shadow-md z-50 max-w-[360px] w-full',
            window.isHasNotch ? 'top-14' : 'top-10'
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
    </ConnectNodeContext.Provider>
  )
}

export function useConnectNode() {
  const context = React.useContext(ConnectNodeContext)
  if (context === undefined) {
    throw new Error('useConnectNode must be used within a ConnectNodeProvider')
  }
  return context
}
