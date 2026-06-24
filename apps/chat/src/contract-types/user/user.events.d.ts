export type UserEvents = {
  AddressScanned: { scanner: string; scannedAddress: string }
  CallEnded: {
    initiator: string
    otherParty: string
    roomId: string
    status: number
    owner: string
  }
  CallReceived: { caller: string; callee: string; roomId: string; status: number; owner: string }
  CallRejectedByPartner: {
    partner: string
    roomId: string
    status: number
    user: string
    owner: string
  }
  ComposingStatusChanged: {
    sender: string
    name: string
    recipient: string
    status: string
    content: string
  }
  ConnectDataChannel: { sender: string; recipient: string; status: boolean }
  ContactAdded: { user: string; contact: string }
  ContactRemoved: { owner: string; contactAddress: string }
  DataChannel: { sender: string; recipient: string; sessionId: string; channelName: string }
  DelegateAdded: { owner: string; delegate: string }
  DelegateRemoved: { owner: string; delegate: string }
  GroupCreatedByUser: { creator: string; groupId: number; groupContractAddress: string }
  GroupJoined: { user: string; groupId: number; groupContractAddress: string }
  JoinCommunityGroup: { group: string }
  MessageDeleted: { deleter: string; messageId: string; recipient: string }
  MessageEdited: { editer: string; messageId: string; recipient: string }
  MessagePinChanged: { messageId: string; partner: string; isPinned: boolean; pinnedBy: string }
  MessageReacted: { messageId: string; reactor: string; reaction: string; recipient: string }
  MessageReadByMe: { messageId: string; reader: string }
  MessageReadByPartner: { messageId: string; reader: string }
  MessageReceived: {
    sender: string
    recipient: string
    messageId: string
    encryptedContent: string
    dataStoreAddress: string
    messageNonce: number
  }
  MessageSent: {
    sender: string
    recipient: string
    messageId: string
    encryptedContent: string
    dataStoreAddress: string
    messageNonce: number
  }
  MessageUnReacted: { messageId: string; reactor: string; recipient: string }
  MuteToggled: { owner: string; conversation: string; isMuted: boolean; timestamp: number }
  NewDataStoreCreated: { newStore: string; previousStore: string }
  NotificationSettingChanged: { user: string; settingType: number; enabled: boolean }
  NotificationsReset: { user: string }
  PartnerMessageDeleted: { messageId: string; sender: string; recipient: string }
  PartnerMessageEdited: { messageId: string; sender: string; recipient: string; newContent: string }
  PartnerMessagePinChanged: {
    messageId: string
    partner: string
    isPinned: boolean
    pinnedBy: string
  }
  PartnerMessageReacted: { messageId: string; recipient: string; reactor: string; reaction: string }
  PartnerMessageUnReacted: { messageId: string; sender: string; recipient: string; reactor: string }
  ProfileUpdated: {
    user: string
    userName: string
    firstName: string
    lastName: string
    avatar: string
    bio: string
  }
  UserBlocked: { blocker: string; blocked: string }
  UserUnblocked: { blocker: string; unblocked: string }
}
