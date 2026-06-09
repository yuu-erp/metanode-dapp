export type EventMap = {
  ComposingStatusChangedCommunity: {
    status: string
    content: string
    group: string
    senderAlias: string
  }
  ComposingStatusChangedGroup: {
    sender: string
    status: string
    content: string
    group: string
    fullName: string
  }

  ComposingStatusChanged: {
    sender: string
    status: string
    content: string
    name: string
    recipient: string
  }

  MessagePinnedAnonymous: {
    messageId: string
    isPinned: boolean
    group: string
    pinnerAlias: string
  }

  PinnedMessagesUpdated: {
    messageId: string
    updatedBy: string
    group: string
    isPinned: boolean
  }

  PartnerMessagePinChanged: {
    messageId: string
    partner: string
    isPinned: boolean
    pinnedBy: string
  }

  MessagePinChanged: {
    messageId: string
    partner: string
    isPinned: boolean
    pinnedBy: string
  }

  UserDisabled: {
    timestamp: string
    disabledBy: string
    user: string
  }

  CameraStatusChanged: {
    roomId: string
    user: string
    isOn: boolean
  }

  ParticipantRejected: {
    roomId: string
    participant: string
    rejectedBy: string
  }

  RaiseHandUpdated: {
    roomId: string
    user: string
    isRaised: boolean
    timestamp: number
    owner: string
  }

  CallReactionSent: {
    roomId: string
    sender: string
    reaction: string
    owner: string
  }

  JoinRequestPending: {
    roomId: string
    participant: string
    owner: string
  }

  CallReceivedSignal: {
    caller: string
    callee: string
    roomId: string
    status: string
    owner: string
  }

  MessageReceived: {
    dataStoreAddress: string
    encryptedContent: string
    messageId: string
    messageNonce: string
    recipient: string
    sender: string
  }
  PartnerMessageReacted: {
    messageId: string
    sender: string
    recipient: string
    reactor: string
    reaction: string
  }
  MessageEdited: {
    editer: string
    messageId: string
    recipient: string
  }

  PartnerMessageEdited: {
    messageId: string
    sender: string
    recipient: string
    newContent: string
  }
  PartnerMessageDeleted: {
    messageId: string
    sender: string
    recipient: string
  }
  DataChannel: {
    sender: string
    recipient: string
    sessionId: string
    channelName: string
  }
  GroupCreatedByUser: {
    groupId: string
    groupContractAddress: string
    creator: string
  }
  RoomCreatedEvent: {
    roomId: string
    name: string
    creator: string
  }

  LeftRoomEvent: {
    roomId: string
    sessionId: string
  }
  CallReceived: {
    caller: string
    callee: string
    roomId: string
    status: string
    owner: string
  }
  MessageSentGroup: {
    messageId: string
    sender: string
    encryptedContent: string
    groupAddress: string
  }
  MessageReactedGroup: {
    messageId: string
    reactor: string
    reaction: string
    groupAddress: string
  }
  MessageEditedGroup: {
    messageId: string
    newContent: string
    groupAddress: string
  }
  MessageDeletedGroup: {
    messageId: string
    groupAddress: string
  }

  AnonymousCommunityCreated: {
    communityId: string
    groupContract: string
    creator: string
  }

  MessageEditedAnonymous: {
    messageId: string
    newEncryptedContent: string
    groupAddress: string
  }

  AnonymousMessageStored: {
    group: string
    content: string
    messageId: string
    sender: string
  }

  MessageDeletedAnonymous: {
    groupAddress: string
    messageId: string
  }

  MessageReactedAnonymous: {
    group: string
    reaction: string
    reactor: string
    messageId: string
  }

  GroupJoined: {
    user: string
    groupId: string
    groupContractAddress: string
  }

  JoinCommunityGroup: {
    group: string
  }

  PartnerMessageUnReacted: {
    messageId: string
    sender: string
    recipient: string
    reactor: string
  }

  MessageUnReactedGroup: {
    messageId: string
    reactor: string
    groupAddress: string
  }

  MessageUnReactedAnonymous: {
    messageId: string
    reactor: string
    group: string
  }

  ContactAdded: {
    user: string
    contact: string
  }

  receiveCallSignal: {
    caller: string
    callee: string
    roomId: string
    status: boolean
  }

  MessageSent: {
    sender: string
    recipient: string
    messageId: string
    encryptedContent: string
    dataStoreAddress: string
    messageNonce: string
  }

  MessageDeleted: {
    messageId: string
    deleter: string
    recipient: string
  }

  MessageReacted: {
    messageId: string
    reactor: string
    reaction: string
    recipient: string
  }

  MessageUnReacted: {
    messageId: string
    reactor: string
    recipient: string
  }

  MessageReadByMe: {
    messageId: string
    reader: string
  }

  MessageReadByPartner: {
    messageId: string
    reader: string
  }

  MessageReadAnonymous: {
    messageId: string
    reader: string
    group: string
  }

  MessageRead: {
    messageId: string
    reader: string
    groupAddress: string
  }

  RoomCreateRequested: {
    requestId: string
    requester: string
    roomName: string
    meet: string
    roomId: string
  }

  FrontendEvent: {
    roomId: string
    toUser: string
    eventType: string
    data: string
  }

  LeaveRequested: {
    roomId: string
    requester: string
    sessionId: string
  }

  CallRejected: {
    caller: string
    callee: string
    roomId: string
  }
}
