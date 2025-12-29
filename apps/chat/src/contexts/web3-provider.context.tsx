import { ReconnectingWebSocketProvider } from '@/infrastructure/websocket-rpc'
import { ethers } from 'ethers'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

// ── Định nghĩa lại ReconnectOptions và DEFAULT_OPTIONS (giữ nguyên) ──
type ReconnectOptions = {
  maxAttempts?: number
  reconnectDelay?: number
  reconnectDelayMax?: number
  keepAliveInterval?: number
  keepAliveTimeout?: number
  debug?: boolean
}

// ── Trạng thái kết nối ──
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// ── Context Type ──
interface Web3ProviderContextType {
  provider: ethers.WebSocketProvider | null
  status: ConnectionStatus
  error: Error | null
  isConnected: boolean
  isConnecting: boolean
  reconnect: () => void
}

// ── Context ──
const Web3ProviderContext = createContext<Web3ProviderContextType | undefined>(undefined)

// ── Custom hook để sử dụng context ──
export const useWeb3Provider = () => {
  const context = useContext(Web3ProviderContext)
  if (!context) {
    throw new Error('useWeb3Provider must be used within Web3ProviderProvider')
  }
  return context
}

// ── Provider Component ──
interface Web3ProviderProps {
  wsUrl: string
  options?: Partial<ReconnectOptions>
  children: ReactNode
}

export function Web3ProviderProvider({ wsUrl, options = {}, children }: Web3ProviderProps) {
  const [provider, setProvider] = useState<ethers.WebSocketProvider | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<Error | null>(null)

  // Tạo instance ReconnectingWebSocketProvider
  const reconnectingProvider = useMemo(() => {
    return new ReconnectingWebSocketProvider(wsUrl, options)
  }, [wsUrl, JSON.stringify(options)]) // memoize dựa trên url + options

  // Cleanup khi unmount
  // Trong Web3ProviderProvider

  useEffect(() => {
    setProvider(reconnectingProvider)
    setStatus('connecting')

    let isMounted = true

    const checkConnection = async () => {
      if (!isMounted) return

      try {
        // Gọi một RPC call đơn giản để test kết nối
        await reconnectingProvider.getNetwork() // hoặc .getBlockNumber()
        if (isMounted) {
          setStatus('connected')
          setError(null)
        }
      } catch (err) {
        console.warn('Connection check failed:', err)
        // Nếu đang reconnect thì giữ 'connecting'
        if (isMounted && status !== 'connected') {
          setStatus('connecting')
        }
      }
    }

    // Kiểm tra ngay lập tức
    checkConnection()

    // Polling mỗi 3-5 giây nếu chưa connected
    const interval = setInterval(() => {
      if (status === 'connecting') {
        checkConnection()
      }
    }, 4000)

    return () => {
      isMounted = false
      clearInterval(interval)
      reconnectingProvider.destroy().catch(console.error)
      setProvider(null)
    }
  }, [reconnectingProvider, status]) // ← thêm status vào dep nếu muốn

  const value: Web3ProviderContextType = {
    provider,
    status,
    error,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    reconnect: () => {
      setStatus('connecting')
      reconnectingProvider['scheduleReconnect']?.() // gọi reconnect thủ công
    }
  }

  return <Web3ProviderContext.Provider value={value}>{children}</Web3ProviderContext.Provider>
}
