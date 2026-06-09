import type { GetProcessedP2PMessagesOutput } from '@/modules/blockchain'

export {}
declare global {
  type BCGroupMessage = {
    messageId: string
    author: string
    finalContent: string
    timestamp: string
    isDeleted: boolean
    reactions: any[]
    readBy: string[]
    isEdited: true
  }
  type BCP2pMessage = {
    messageId: string
    sender: string // address
    recipient: string // address
    encryptedContent?: string
    timestamp: string // uint256
    finalContent?: string
    isRead?: boolean
    reactionSummary?: string
  }
  type BCAnonymousGroupMessage = {
    messageId: string
    author: string
    finalContent: string
    timestamp: string
    isDeleted: boolean
    reactions: any[]
    readBy: string[]
    isEdited: true
  }
}
