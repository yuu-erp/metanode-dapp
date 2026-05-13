import { contractAddresses } from '@/configs'
import { abis } from '@/contract/abis'
import { useChatAdminEvents } from '@/modules/chat-admin/events'
import { decodeAbi, eventLog } from '@/shared'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
  type ReactNode
} from 'react'

export type ChatAdminContext = {
  address: string
}

export const chatAdminContext = createContext<ChatAdminContext>(null!)

export const ChatAdminProvider = ({
  children,
  address,
  loadingNode = null
}: PropsWithChildren & {
  address: string
  loadingNode?: ReactNode
}) => {
  const [mount, setMount] = useState(false)

  useChatAdminEvents()

  useEffect(() => {
    if (!address) return
    eventLog.registerEvent(address, [contractAddresses.factory])
  }, [address])

  useEffect(() => {
    decodeAbi.registerAbi(Object.values(abis).flat()).then(() => setMount(true))
  }, [])

  return (
    <chatAdminContext.Provider value={{ address }}>
      {mount ? children : loadingNode}
    </chatAdminContext.Provider>
  )
}

export const useChatAdminContext = () => {
  const context = useContext(chatAdminContext)
  if (!context) throw new Error('Chat admin context must use in chat admin provider')
  return context
}
