import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import { userContract } from '../blockchain/user-contract/abis'
import { groupContract } from '../blockchain/group-contract/abis'
import { anonymousGroupContract } from '../blockchain/anonymous-group-contract/abis'
import { factoryContract } from '../blockchain/factory-contract/abis'
import { meetingContract } from '../blockchain/meeting-contract'

export type EventMap = {
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
  GroupCreated: {
    groupId: string
    contractAddress: string
    admin: string
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

const abi: any[] = [
  ...userContract,
  ...groupContract,
  ...anonymousGroupContract,
  ...meetingContract,
  ...factoryContract
].filter((item) => item?.type === 'event')
export class EventLogContainer {
  private readonly _decodeAbi: DecodeAbi
  private readonly _eventLog: EventLog<EventMap>
  constructor() {
    console.log('KHỞI TẠO EVENT LOG CONTAINER', abi)
    this._decodeAbi = new DecodeAbi()
    this._eventLog = new EventLog<EventMap>(this._decodeAbi)
  }

  get eventLog(): EventLog<EventMap> {
    return this._eventLog
  }

  get decodeAbi(): DecodeAbi {
    return this._decodeAbi
  }

  public async registerAbi() {
    console.log('thanhduy - this')
    const rs = await this._decodeAbi?.registerAbi?.(abi)
    return rs
  }
}

//"69564194512df04ed7ff00da058f08e573181f53006105e99cd7ca64d927bc0f"
