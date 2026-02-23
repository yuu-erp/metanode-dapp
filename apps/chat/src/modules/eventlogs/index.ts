import { DecodeAbi, EventLog } from '@metanodejs/event-log'
import abi from './abi.json'

export type EventMap = {
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
  FrontendEvent: {
    seesionHash: string
    roomId: string
    sessionId: string
    eventType: string
    data: string
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
}
export class EventLogContainer {
  private readonly _decodeAbi: DecodeAbi
  private readonly _eventLog: EventLog<EventMap>
  constructor() {
    console.log('KHỞI TẠO EVENT LOG CONTAINER', abi)
    this._decodeAbi = new DecodeAbi()
    this._decodeAbi.registerAbi(abi)
    this._eventLog = new EventLog<EventMap>(this._decodeAbi)
  }

  get eventLog(): EventLog<EventMap> {
    return this._eventLog
  }

  get decodeAbi(): DecodeAbi {
    return this._decodeAbi
  }

  public registerAbi() {
    this._decodeAbi.registerAbi(abi)
  }
}
