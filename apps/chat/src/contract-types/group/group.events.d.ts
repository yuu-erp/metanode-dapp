export type GroupEvents = {
  AdminAdded: { newAdmin: string; addedBy: string; permissions: number; group: string }
  AdminRemoved: { removedAdmin: string; removedBy: string; group: string }
  AdminTransferred: { oldAdmin: string; newAdmin: string; groupAddress: string }
  AllHandsCleared: { sessionId: string; host: string; timestamp: number }
  CallEndedGroup: { sessionId: string; duration: number; groupAddress: string }
  CallEndedSignal: {
    initiator: string
    otherParty: string
    roomId: string
    status: number
    owner: string
  }
  CallReactionSent: {
    sessionId: string
    participant: string
    reaction: string
    groupAddress: string
  }
  CallReceivedSignal: {
    caller: string
    callee: string
    roomId: string
    status: number
    owner: string
  }
  CallRejectedByPartner: {
    partner: string
    roomId: string
    status: number
    user: string
    owner: string
  }
  CallStarted: {
    host: string
    sessionId: string
    roomId: string
    linkMeet: string
    groupAddress: string
  }
  CameraStatusChanged: {
    sessionId: string
    participant: string
    isOn: boolean
    groupAddress: string
  }
  ChangeInfoGroup: {
    groupName: string
    groupAvatar: string
    groupDescription: string
    timestamp: number
  }
  ComposingStatusChangedGroup: {
    sender: string
    fullName: string
    status: string
    content: string
    group: string
  }
  ExecutorAdded: { executor: string; permissions: number; addedBy: string }
  ExecutorPermissionsUpdated: {
    executor: string
    oldPermissions: number
    newPermissions: number
    updatedBy: string
  }
  ExecutorRemoved: { executor: string; removedBy: string }
  GroupDefaultPermissionsUpdated: {
    updatedBy: string
    timestamp: number
    sendMessages: boolean
    reactionMessages: boolean
    sendPhotoFileLink: boolean
    addUsers: boolean
    pinMessages: boolean
    changeChatInfo: boolean
  }
  GroupInfoUpdated: {
    oldName: string
    oldAvatar: string
    oldDescription: string
    newName: string
    newAvatar: string
    newDescription: string
    timestamp: number
    groupAddress: string
  }
  HistoryVisibilityChanged: { newPolicy: number; groupAddress: string }
  HostChanged: { sessionId: string; newHost: string; groupAddress: string }
  InviteLinkCreated: {
    linkCode: string
    expiresAt: number
    maxUses: number
    createdBy: string
    groupAddress: string
  }
  InviteLinkRevoked: { linkCode: string; revokedBy: string; groupAddress: string }
  InviteLinkUsed: { linkCode: string; usedBy: string; groupAddress: string }
  MemberAdded: { member: string; publicKey: string; groupAddress: string }
  MemberBanned: { sessionId: string; participant: string; hostSender: string; groupAddress: string }
  MemberKicked: { sessionId: string; participant: string; kickedBy: string; groupAddress: string }
  MemberLeft: { member: string; groupAddress: string }
  MemberMuted: { member: string; mutedBy: string; timestamp: number }
  MemberRemoved: { member: string; groupAddress: string }
  MemberUnbanned: {
    sessionId: string
    participant: string
    unbannedBy: string
    groupAddress: string
  }
  MemberUnmuted: { member: string; unmutedBy: string; timestamp: number }
  MessageDeletedGroup: { messageId: string; groupAddress: string }
  MessageEditedGroup: { messageId: string; newContent: string; groupAddress: string }
  MessageForceDeleted: { messageId: string; sender: string; group: string }
  MessageReactedGroup: {
    messageId: string
    reactor: string
    reaction: string
    groupAddress: string
  }
  MessageRead: { messageId: string; reader: string; groupAddress: string }
  MessageSentGroup: {
    groupId: number
    messageId: string
    sender: string
    encryptedContent: string
    groupAddress: string
  }
  MessageUnReactedGroup: { messageId: string; reactor: string; groupAddress: string }
  NewChatMessage: {
    roomId: string
    sender: string
    message: string
    timestamp: number
    groupAddress: string
  }
  NewDataStoreCreated: { newStore: string; previousStore: string; groupAddress: string }
  ParticipantApproved: { sessionId: string; participant: string; groupAddress: string }
  ParticipantCountUpdated: { sessionId: string; newCount: number; groupAddress: string }
  ParticipantJoined: {
    sessionId: string
    participant: string
    quantity: number
    groupAddress: string
  }
  ParticipantLeft: {
    sessionId: string
    participant: string
    quantity: number
    groupAddress: string
  }
  ParticipantRejected: { sessionId: string; participant: string; groupAddress: string }
  PinnedMessagesUpdated: { messageIds: string[]; updatedBy: string; group: string }
  RaiseHandUpdated: { user: string; isRaiseHand: boolean; timestamp: number }
  RequestMute: {
    sessionId: string
    participant: string
    muteMic: boolean
    muteCam: boolean
    groupAddress: string
  }
  RoomLockChanged: { sessionId: string; locked: boolean; groupAddress: string }
  ScreenShareStarted: { sessionId: string; sharer: string; groupAddress: string }
  ScreenShareStopped: { sessionId: string; sharer: string; groupAddress: string }
  UserBannedFromGroup: { user: string; bannedBy: string; timestamp: number; groupAddress: string }
  UserUnbannedFromGroup: { user: string; unbannedBy: string; groupAddress: string }
}
