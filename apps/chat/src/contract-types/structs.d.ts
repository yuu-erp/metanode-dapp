export type BCDownloadSession = {
  fileKey: string
  user: string
  confirmations: string[]
  isConfirmed: boolean
}
export type BCInfo = {
  owner: string
  merkleRoot: string
  contentLen: number
  totalChunks: number
  expireTime: number
  name: string
  ext: string
  contentDisposition: string
  contentID: string
  status: number
}
export type BCFileProgress = {
  lastChunkHash: string
  processedChunks: number
  processedLength: number
}
export type BCGroupChatV3Reaction = { reactor: string; reaction: string }
export type BCGroupChatV3ProcessedGroupMessage = {
  messageId: string
  author: string
  finalContent: string
  timestamp: number
  isDeleted: boolean
  reactions: Structs.BCGroupChatV3Reaction[]
  readBy: string[]
  readByAlias: string[]
  isEdited: boolean
  isDecryptable: boolean
  isPinned: boolean
}
export type BCGroupMembership = { groupId: number; groupContractAddress: string; isActive: boolean }
export type BCConversationList = {
  allRegularGroups: Structs.BCGroupMembership[]
  allAnonymousGroups: string[]
  allP2PPartners: string[]
}
export type BCNotificationSettings = {
  p2pChatEnabled: boolean
  reactionsEnabled: boolean
  showPreview: boolean
}
export type BCInboxItem = {
  name: string
  avatar: string
  firstName: string
  lastName: string
  conversationId: string
  latestMessageContent: string
  latestMessageTimestamp: number
  unreadCount: number
  conversationType: string
  sender: string
  fullName: string
  isMuted: boolean
  messageId: string
}
export type BCAnonymousCommunityMembership = { groupContract: string }
export type BCProcessedP2PMessage = {
  messageId: string
  sender: string
  recipient: string
  finalContent: string
  timestamp: number
  isDeleted: boolean
  reactionSummary: string
  isRead: boolean
  isEdited: boolean
}
export type BCUserProfile = {
  userName: string
  firstName: string
  lastName: string
  avatar: string
  bio: string
}
export type BCNotiParams = { repo: string; title: string; body: string }
