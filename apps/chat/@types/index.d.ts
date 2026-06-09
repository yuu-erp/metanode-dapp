export {}
declare global {
  interface Window {
    finSdk?: any
    fiaiSDK?: any
  }

  type BaseConversation = {
    id: string
    type: string
  }

  type UserStatus = {
    status: string
    [key: string]: any
  }

  type ReactionItemData = {
    reaction: string
    reactor: string[]
  }

  type BaseMessage = {
    content?: any
    sender: string
    id: string
    timestamp: string
    isRead?: boolean
    reactions: ReactionItemData[]
    isMine?: boolean
  }

  type FulleMessage = Omit<BaseMessage, 'content'> & {
    content?: string
    type: string
    isFailed?: boolean
    isEdited?: boolean
    status?: string
    fileId?: string
    stickerId?: string
    duration?: number
    replyTo?: string
    forwardFrom?: string
    forwardFromType?: string
  }
}
