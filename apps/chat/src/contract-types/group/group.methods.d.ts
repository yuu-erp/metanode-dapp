import type * as Structs from '../structs'
export type GroupMehods = {
  EXEC_ADD_ALL_MEMBERS: [null, number]
  EXEC_ADD_MEMBER: [null, number]
  EXEC_ALL: [null, number]
  EXEC_BAN_USER: [null, number]
  EXEC_BULK_DELETE_MESSAGES: [null, number]
  EXEC_CREATE_INVITE_LINK: [null, number]
  EXEC_DELETE_MESSAGE: [null, number]
  EXEC_PIN_MESSAGE: [null, number]
  EXEC_REMOVE_ALL_MEMBERS: [null, number]
  EXEC_REMOVE_MEMBER: [null, number]
  EXEC_REVOKE_INVITE_LINK: [null, number]
  EXEC_SET_HISTORY_VISIBILITY: [null, number]
  EXEC_UNBAN_USER: [null, number]
  EXEC_UPDATE_GROUP_INFO: [null, number]
  MAX_MESSAGES_PER_STORE: [null, number]
  PERMISSION_ALL: [null, number]
  activeInviteLinks: [{ '': number }, string]
  addAdmin: [{ newAdmin: string; permissions: number }, void]
  addAllMember: [{ users: string[]; encryptedKeys: string[] }, void]
  addAllMemberForUser: [{ users: string[]; encryptedKeys: string[] }, void]
  addExecutor: [{ executor: string; permissions: number }, void]
  addMember: [{ user: string; encryptedKeyForNewMember: string }, void]
  addMemberForUser: [{ user: string; encryptedKeyForNewMember: string }, void]
  admin: [null, string]
  adminBulkDeleteMessages: [{ messageIds: string[] }, void]
  adminDeleteMessage: [{ messageId: string }, void]
  adminPermissions: [{ '': string }, number]
  approveParticipant: [{ _participant: string }, void]
  banMember: [{ _participant: string }, void]
  banUser: [{ userToBan: string }, void]
  canAddUsers: [{ sender: string }, boolean]
  canChangeChatInfo: [{ sender: string }, boolean]
  canPinMessages: [{ sender: string }, boolean]
  canReactToMessage: [{ sender: string }, boolean]
  canSendMedia: [{ sender: string; mediaType: number }, boolean]
  canSendMessage: [{ sender: string }, boolean]
  currentCall: [
    null,
    {
      sessionId: string
      roomId: string
      host: string
      startTime: number
      endTime: number
      linkMeet: string
      participantCount: number
      currentSharer: string
      status: number
      password: string
      isApprovalRequired: boolean
    }
  ]
  currentDataStore: [null, string]
  deleteMessage: [{ messageId: string }, void]
  deleted: [null, boolean]
  deletedMessages: [{ '': string }, boolean]
  descriptionGroup: [null, string]
  editMessage: [{ messageId: string; newEncryptedContent: string }, void]
  encryptedGroupKeys: [{ '': string }, string]
  endCall: [null, void]
  executorList: [{ '': number }, string]
  executorPermissions: [{ '': string }, number]
  factory: [null, string]
  getAdminPermissions: [{ adminAddress: string }, number]
  getAllStoreAddresses: [null, string[]]
  getBannedMembersInSession: [null, string[]]
  getCurrentDataStoreAddress: [null, string]
  getExecutorList: [null, string[]]
  getExecutorPermissions: [{ executor: string }, number]
  getExecutorPermissionsBreakdown: [
    { executor: string },
    {
      hasAddMember: boolean
      hasRemoveMember: boolean
      hasUpdateGroupInfo: boolean
      hasDeleteMessage: boolean
      hasBanUser: boolean
      hasInviteLink: boolean
      hasSetVisibility: boolean
      hasPinMessage: boolean
      hasBulkDelete: boolean
    }
  ]
  getGroupBanList: [null, string[]]
  getGroupDefaultPermissions: [
    null,
    {
      sendMessages: boolean
      sendPhotoFileLink: boolean
      addUsers: boolean
      pinMessages: boolean
      changeChatInfo: boolean
      lastUpdate: number
    }
  ]
  getGroupInfo: [
    null,
    {
      name: string
      avatar: string
      description: string
      memberCount: number
      groupAdmin: string
      isDeleted: boolean
    }
  ]
  getLatestMessageId: [null, string]
  getListPinnedMessagesGroup: [null, string[]]
  getMemberListGroup: [null, string[]]
  getMessageById: [{ _messageId: string }, Structs.BCGroupChatV3ProcessedGroupMessage]
  getMyEncryptedGroupKey: [null, string]
  getMyPermissions: [null, number]
  getPinnedMessageGroup: [
    { pinnedMessageId: string; beforeCount: number; afterCount: number },
    Structs.BCGroupChatV3ProcessedGroupMessage[]
  ]
  getProcessedGroupMessages: [
    { page: number; limit: number },
    Structs.BCGroupChatV3ProcessedGroupMessage[]
  ]
  getStoreInfo: [{ storeAddress: string }, { owner: string; previous: string }]
  getUnreadCountForRecentMessages: [{ recentMessageLimit: number; owner: string }, number]
  groupAvatar: [null, string]
  groupBanList: [{ '': number }, string]
  groupBanTimestamps: [{ '': string }, number]
  groupBannedUsers: [{ '': string }, boolean]
  groupDefaultPermissions: [
    null,
    {
      sendMessages: boolean
      reactionMessages: boolean
      sendPhotoFileLink: boolean
      addUsers: boolean
      pinMessages: boolean
      changeChatInfo: boolean
      lastUpdate: number
    }
  ]
  groupId: [null, number]
  groupName: [null, string]
  handleRaiseHand: [{ _isRaiseHand: boolean }, void]
  historyVisibilityPolicy: [null, number]
  hostLowerHand: [{ _participant: string }, void]
  individualMuteStatus: [{ '': string }, boolean]
  individualMuteTimestamp: [{ '': string }, number]
  initialAdmin: [null, string]
  initialize: [
    {
      _factory: string
      _admin: string
      _groupId: number
      _groupName: string
      _groupAvatar: string
      _description: string
      _encryptedInitialGroupKey: string
      _initialPolicy: number
      _publicKeyAdmin: string
    },
    void
  ]
  inviteLinks: [
    { '': string },
    {
      linkCode: string
      createdBy: string
      createdAt: number
      expiresAt: number
      maxUses: number
      usedCount: number
      isRevoked: boolean
      requiresApproval: boolean
    }
  ]
  isBanned: [{ '': string; '': string }, boolean]
  isCameraOn: [{ '': string; '': string }, boolean]
  isExecutor: [{ executor: string }, boolean]
  isInCall: [{ '': string; '': string }, boolean]
  isMessagePinned: [{ '': string }, boolean]
  isUserBanned: [{ user: string }, boolean]
  isWaitingInSession: [{ '': string; '': string }, boolean]
  joinCall: [{ _password: string }, void]
  kickFromCall: [{ _participant: string }, void]
  leaveCall: [null, void]
  leaveGroup: [{ encryptedContent: string }, void]
  markMessagesAsRead: [{ messageIds: string[] }, void]
  memberJoinTimestamps: [{ '': string }, number]
  memberList: [{ '': number }, string]
  members: [{ '': string }, { exists: boolean; index: number }]
  messageAuthors: [{ '': string }, string]
  messageEdits: [{ '': string }, string]
  messageLocations: [
    { '': string },
    { storeContract: string; indexInStore: number; isValid: boolean }
  ]
  messageReactions: [{ '': string; '': string }, string]
  messageReadStatus: [{ '': string; '': string }, boolean]
  muteMember: [{ member: string }, void]
  pinMessage: [{ messageId: string; isPinned: boolean }, void]
  pinMessageForAllMembers: [{ messageId: string; isPinned: boolean }, void]
  pinnedMessageIds: [{ '': number }, string]
  publicKeyAdmin: [null, string]
  reactToMessage: [{ messageId: string; reaction: string }, void]
  receiveCallSignal: [
    { caller: string; callee: string; roomId: string; status: number; owner: string },
    void
  ]
  receiveEndCallSignal: [
    { initiator: string; otherParty: string; roomId: string; status: number; owner: string },
    void
  ]
  receiveRejectCallSignal: [
    { caller: string; callee: string; roomId: string; status: number; owner: string },
    void
  ]
  rejectParticipant: [{ _participant: string }, void]
  removeAdmin: [{ adminToRemove: string }, void]
  removeAllMember: [{ users: string[] }, void]
  removeExecutor: [{ executor: string }, void]
  removeMember: [{ user: string }, void]
  requestMuteMember: [{ _participant: string; _muteMic: boolean; _muteCam: boolean }, void]
  sendCallReaction: [{ _reaction: string }, void]
  sendMessage: [
    { encryptedContent: string; recipientOwners: string[]; recipientContracts: string[] },
    void
  ]
  sendMessageGroup: [{ _message: string }, void]
  setComposingStatusGroup: [{ status: string; content: string }, void]
  setDeleted: [null, void]
  setGroupDefaultPermissions: [
    {
      _sendMessages: boolean
      _reactionMessages: boolean
      _sendPhotoFileLink: boolean
      _addUsers: boolean
      _pinMessages: boolean
      _changeChatInfo: boolean
    },
    void
  ]
  setHistoryVisibility: [{ _newPolicy: number }, void]
  startCallGroup: [
    { _sessionId: string; technicalRoomId: string; linkMeet: string; _password: string },
    void
  ]
  startScreenShare: [null, void]
  stopScreenShare: [null, void]
  toggleCamera: [{ _isOn: boolean }, void]
  totalMessageCount: [null, number]
  transferAdmin: [{ newAdmin: string; _newPublicKeyAdmin: string }, void]
  transferHost: [{ _newHost: string }, void]
  unReactToMessage: [{ messageId: string }, void]
  unbanMember: [{ _participant: string }, void]
  unmuteMember: [{ member: string }, void]
  updateAdminPermissions: [{ adminAddress: string; newPermissions: number }, void]
  updateExecutorPermissions: [{ executor: string; newPermissions: number }, void]
  updateGroupInfo: [{ _newName: string; _newAvatar: string; _newDescription: string }, void]
  userToPublicKeyAdmin: [{ '': string }, string]
  userToSessionId: [{ '': string }, string]
}
