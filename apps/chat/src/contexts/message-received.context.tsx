'use client'
import * as React from 'react'
import { createContext, useContext } from 'react'
import { useWeb3Provider } from '.'
import { useCurrentAccount } from '@/shared/hooks'
import { Contract, ethers } from 'ethers'
import { getSession } from '@/bootstrap'

export interface MessageReceivedState {}

const MessageReceivedContext = createContext<MessageReceivedState | undefined>(undefined)

interface MessageReceivedProviderProps extends React.PropsWithChildren {}

const MESSAGE_RECEIVED_ABI = [
  'event MessageReceived(address sender, address recipient, bytes32 messageId, string encryptedContent, address dataStoreAddress, uint256 messageNonce)'
] as const

export function MessageReceivedProvider({ children }: MessageReceivedProviderProps) {
  const { security, userBlockchain } = getSession()
  const { provider } = useWeb3Provider()
  const { data: currentAccount } = useCurrentAccount()

  // Memoize contract để tránh tạo mới không cần thiết
  const contract = React.useMemo(() => {
    if (
      !provider ||
      !currentAccount?.contractAddress ||
      !ethers.isAddress(currentAccount.contractAddress)
    ) {
      return null
    }

    try {
      return new Contract(`0x${currentAccount.contractAddress}`, MESSAGE_RECEIVED_ABI, provider)
    } catch (error) {
      console.error('Failed to create contract instance:', error)
      return null
    }
  }, [provider, currentAccount?.contractAddress])

  // Listener cho event MessageReceived
  React.useEffect(() => {
    if (!contract) return

    const handleMessageReceived = async (
      sender: string,
      recipient: string,
      messageId: string,
      encryptedContent: string,
      dataStoreAddress: string,
      messageNonce: bigint,
      event: ethers.ContractEventPayload
    ) => {
      console.log('New message received:', {
        sender,
        recipient,
        messageId,
        encryptedContent,
        dataStoreAddress,
        messageNonce: messageNonce.toString(),
        txHash: event.log?.transactionHash,
        blockNumber: event.log?.blockNumber
      })
      if (!currentAccount) return

      const publicKey = await userBlockchain.userContractService.publicKey(
        currentAccount.address,
        sender
      )

      const data = await security?.securityService.decryptAesECDH(
        publicKey,
        currentAccount.address,
        encryptedContent
      )
      console.log('Decrypt message received: ', data)

      // TODO: Cập nhật UI (thêm tin nhắn mới, cập nhật conversation list, etc.)
    }

    contract.on('MessageReceived', handleMessageReceived)

    // Cleanup khi contract/provider thay đổi hoặc unmount
    return () => {
      contract.off('MessageReceived', handleMessageReceived)
    }
  }, [contract]) // ← Chỉ phụ thuộc vào contract

  return <MessageReceivedContext.Provider value={{}}>{children}</MessageReceivedContext.Provider>
}

export function useMessageReceived() {
  const context = useContext(MessageReceivedContext)
  if (context === undefined) {
    throw new Error('useMessageReceived must be used within an MessageReceivedProvider')
  }
  return context
}
