export type EventMap = {
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
}
