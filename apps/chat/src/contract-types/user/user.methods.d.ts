import type * as Structs from '../structs'
export type UserMehods = {
  AddContact: [{ _contactAddress: string }, void]
  MAX_MESSAGES_PER_STORE: [null, number]
  RemoveContact: [{ _contactAddress: string }, void]
  addDelegate: [{ _delegate: string }, void]
  addScanHistory: [{ _scannedAddress: string }, void]
  amIDelegate: [null, boolean]
  blockUser: [{ _userToBlock: string }, void]
  blockedUsers: [{ '': string }, boolean]
  compareStrings: [{ a: string; b: string }, boolean]
  conversationCache: [
    { '': string },
    {
      lastMessageTimestamp: number
      lastMessageContent: string
      unreadCount: number
      exists: boolean
      messageId: string
    }
  ]
  conversationDataStores: [{ '': string }, string]
  createdAnonymousCommunities: [{ '': string }, { groupContract: string }]
  createdAnonymousCommunityList: [{ '': number }, string]
  createdGroupIds: [{ '': number }, number]
  createdGroups: [
    { '': number },
    { groupId: number; groupContractAddress: string; isActive: boolean }
  ]
  delegateList: [{ '': number }, string]
  deleteMessage: [{ partnerContract: string; _messageId: string }, void]
  deleteMessageV2: [{ partnerContract: string; _messageId: string }, void]
  deletedMessages: [{ '': string }, boolean]
  detailedSettings: [
    null,
    { p2pChatEnabled: boolean; reactionsEnabled: boolean; showPreview: boolean }
  ]
  editMessage: [
    {
      partnerContract: string
      _messageId: string
      newEncryptedContent: string
      newEncryptedContentForPartner: string
    },
    void
  ]
  factory: [null, string]
  getAllMyAnonymousCommunities: [null, string[]]
  getAllMyGroups: [null, Structs.BCGroupMembership[]]
  getConversationList: [null, Structs.BCConversationList]
  getConversationStore: [{ partner: string }, string]
  getDelegates: [null, string[]]
  getDelegatesFromFactory: [null, string[]]
  getDetailedSettings: [null, Structs.BCNotificationSettings]
  getEditedMessageContent: [{ messageId: string }, string]
  getFullInbox: [null, Structs.BCInboxItem[]]
  getFullInboxPaginatedOptimized: [{ offset: number; limit: number }, Structs.BCInboxItem[]]
  getInteractedPartners: [null, string[]]
  getLatestMessageId: [{ partnerContractAddress: string }, string]
  getMessageById: [
    { _messageId: string },
    {
      messageId: string
      sender: string
      recipient: string
      encryptedContent: string
      timestamp: number
      edited: boolean
    }
  ]
  getMyCreatedAnonymousCommunities: [null, Structs.BCAnonymousCommunityMembership[]]
  getMyCreatedGroups: [null, Structs.BCGroupMembership[]]
  getMyJoinedAnonymousCommunities: [null, Structs.BCGroupMembership[]]
  getMyJoinedGroups: [null, Structs.BCGroupMembership[]]
  getMyOwner: [null, string]
  getPartnerPinnedMessages: [{ partner: string }, string[]]
  getPinnedMessage: [
    {
      partnerContractAddress: string
      pinnedMessageId: string
      beforeCount: number
      afterCount: number
    },
    Structs.BCProcessedP2PMessage[]
  ]
  getPinnedMessages: [{ partner: string }, string[]]
  getProcessedP2PMessages: [
    { partnerContractAddress: string; page: number; limit: number },
    Structs.BCProcessedP2PMessage[]
  ]
  getReaction: [{ _messageId: string; _reactor: string }, string]
  getScanHistory: [null, string[]]
  getUnreadMessageCount: [{ partnerContractAddress: string }, number]
  getUserProfile: [null, Structs.BCUserProfile]
  initialize: [
    {
      _factory: string
      _owner: string
      _publicKey: string
      _userName: string
      _firstName: string
      _lastName: string
      _avatar: string
      _bio: string
    },
    void
  ]
  interactedPartners: [{ '': number }, string]
  isConversationMuted: [{ '': string }, boolean]
  isDelegate: [{ '': string }, boolean]
  isMessageDeleted: [{ messageId: string }, boolean]
  isMessageReadByMe: [{ '': string }, boolean]
  isMessageReadByPartner: [{ '': string }, boolean]
  joinedAnonymousGroupList: [{ '': number }, string]
  joinedAnonymousGroups: [
    { '': string },
    { groupId: number; groupContractAddress: string; isActive: boolean }
  ]
  joinedGroupIds: [{ '': number }, number]
  joinedGroups: [
    { '': number },
    { groupId: number; groupContractAddress: string; isActive: boolean }
  ]
  markMessagesAsRead: [{ partnerContract: string; messageIds: string[] }, void]
  meetingFactory: [null, string]
  meetingFactoryAddress: [null, string]
  messageEdits: [{ '': string }, string]
  messageLocations: [
    { '': string },
    { storeContract: string; indexInStore: number; isValid: boolean }
  ]
  messageReactions: [{ '': string; '': string }, string]
  messageSenders: [{ '': string }, string]
  owner: [null, string]
  partnerDeletedMessages: [{ '': string }, boolean]
  partnerMessageEdits: [{ '': string }, string]
  partnerMessageReactions: [{ '': string; '': string }, string]
  partnerPinnedMessages: [{ '': string; '': number }, string]
  pinMessage: [{ partner: string; messageId: string }, void]
  pinMessageFromPartner: [{ partner: string; messageId: string }, void]
  pinnedMessages: [{ '': string; '': number }, string]
  publicKey: [null, string]
  reactToMessage: [
    { partnerContract: string; _messageId: string; _reaction: string; _reactionToPartner: string },
    void
  ]
  receiveBatchReadReceipts: [{ _messageIds: string[] }, void]
  receiveCallSignal: [
    { caller: string; callee: string; roomId: string; status: number; owner: string },
    void
  ]
  receiveChannlel: [
    {
      _senderContract: string
      _recipientContractAddress: string
      sessionId: string
      channelName: string
    },
    void
  ]
  receiveConnect: [
    { _senderContract: string; _recipientContractAddress: string; status: boolean },
    void
  ]
  receiveDeleteNotification: [{ messageId: string }, void]
  receiveEditNotification: [{ messageId: string; newContent: string }, void]
  receiveEndCallSignal: [
    { initiator: string; otherParty: string; roomId: string; status: number; owner: string },
    void
  ]
  receiveMessage: [{ _senderContract: string; _messageId: string; encryptedContent: string }, void]
  receiveMessageAndReactAnonymousGroup: [
    { userWallet: string; params: Structs.BCNotiParams; typeReceive: string },
    void
  ]
  receiveReactionNotification: [{ messageId: string; reactor: string; reaction: string }, void]
  receiveRejectCallSignal: [
    { caller: string; callee: string; roomId: string; status: number; owner: string },
    void
  ]
  receiveUnReactionNotification: [{ messageId: string; reactor: string }, void]
  registerCreatedAnonymousCommunity: [{ groupContract: string }, void]
  registerCreatedGroup: [{ _groupId: number; _groupContractAddress: string }, void]
  registerJoinedAnonymousCommunity: [{ groupContract: string }, void]
  registerJoinedGroup: [{ _groupId: number; _groupContractAddress: string }, void]
  removeDelegate: [{ _delegate: string }, void]
  resetNotificationSettings: [null, void]
  scannedHistory: [{ '': number }, string]
  sendConnectDCEvent: [{ _recipientContractAddress: string; status: boolean }, void]
  sendDataChannel: [
    { _recipientContractAddress: string; sessionId: string; channelName: string },
    void
  ]
  sendMessage: [
    {
      _recipientContractAddress: string
      _encryptedContentForRecipient: string
      _encryptedContentForSelf: string
    },
    {
      sender: string
      recipient: string
      messageId: string
      encryptedContent: string
      dataStoreAddress: string
      messageNonce: number
    }
  ]
  sendMessageForCall: [
    {
      _recipientContractAddress: string
      _encryptedContentForRecipient: string
      _encryptedContentForSelf: string
      typeCall: string
    },
    {
      sender: string
      recipient: string
      messageId: string
      encryptedContent: string
      dataStoreAddress: string
      messageNonce: number
    }
  ]
  setComposingStatus: [{ recipient: string; status: string; content: string }, void]
  setMeetingFactory: [{ _newMeetingFactoryAddress: string }, void]
  setP2PChatEnabled: [{ enabled: boolean }, void]
  setReactionsEnabled: [{ enabled: boolean }, void]
  setShowPreview: [{ enabled: boolean }, void]
  toggleMute: [{ _conv: string; _mute: boolean }, void]
  unReactToMessage: [{ partnerContract: string; messageId: string }, void]
  unblockUser: [{ _userToUnblock: string }, void]
  unpinMessage: [{ partner: string; messageId: string }, void]
  unpinMessageFromPartner: [{ partner: string; messageId: string }, void]
  unregisterCreatedAnonymousCommunity: [{ groupContract: string }, void]
  unregisterCreatedGroup: [{ _groupId: number }, void]
  unregisterGroup: [{ _groupId: number }, void]
  unregisterJoinedAnonymousCommunity: [{ groupContract: string }, void]
  updateCacheFromGroup: [
    { groupAddress: string; sender: string; timestamp: number; content: string; messageId: string },
    void
  ]
  updateMyCacheForConversation: [
    { conversationAddress: string; timestamp: number; content: string; incrementUnread: boolean },
    void
  ]
  updateProfile: [
    { _userName: string; _firstName: string; _lastName: string; _avatar: string; _bio: string },
    void
  ]
  userProfile: [
    null,
    { userName: string; firstName: string; lastName: string; avatar: string; bio: string }
  ]
}
