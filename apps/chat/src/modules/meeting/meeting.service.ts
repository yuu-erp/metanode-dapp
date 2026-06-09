import { sendCommand } from '@metanodejs/system-core'
import type { MeetingViewInput } from './meeting.type'

export class MeetingService {
  constructor() {}

  // private async createRoom(account: Account, conversation: Conversation) {
  //   const requestId = randomBytes32()
  //   const promise = new Promise<MeetingData>(async (resolve, reject) => {
  //     const timeout = setTimeout(() => {
  //       off()
  //       reject(new Error('Create call timeout'))
  //     }, 15000)

  //     const off = this.eventLogContainer.eventLog.on('RoomCreateRequested', async (event) => {
  //       if (formatAddress(event.requester) === formatAddress(account.address)) {
  //         clearTimeout(timeout)
  //         off() // Stop listening
  //         resolve({
  //           caller: account.address,
  //           callee: conversation.conversationId,
  //           roomId: `0x${event.requestId}`,
  //           address: account.address,
  //           sessionId: '',
  //           type: 'direct'
  //         })
  //       }
  //     })
  //   })

  //   await this.meetingContract.createRoom({
  //     from: account.address,
  //     inputData: {
  //       _receiver: conversation.conversationId,
  //       meet: conversation.conversationType !== 'p2p',
  //       requestId,
  //       roomName: `Room-${account.address}`
  //     }
  //   })

  //   return await promise
  // }

  async goToMeetingView(input: MeetingViewInput) {
    //@ts-ignore
    if (!window?.fiaiSDK) {
      const data = await sendCommand('startCallRTC', {
        //@ts-ignore
        query: new URLSearchParams(input).toString()
      })
      console.log('[CallService] Call created:', data)
    }
  }
}
