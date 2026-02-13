import type { Account } from '@/modules/account'
import type { FactoryContract, MettingContract, UserContract } from '@/modules/blockchain'
import type { Conversation } from '@/modules/conversation'
import type { EventLogContainer } from '@/modules/eventlogs'
import { formatAddress } from '@/shared/utils'
import { sendCommand } from '@metanodejs/system-core'

export class CallService {
  constructor(
    private readonly mettingContract: MettingContract,
    private readonly userContract: UserContract,
    private readonly factoryContract: FactoryContract,
    private readonly eventLogContainer: EventLogContainer
  ) {}

  async createCall(account: Account, conversation: Conversation): Promise<void> {
    try {
      // const account = await this.accountService.getCurrentAccount()
      // if (!account) throw new Error('No active account')
      const receiver = conversation.conversationId
      const sessionId = Math.random().toString(36).substring(7)
      // 1. Listen for RoomCreatedEvent
      const promise = new Promise<string>(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          off()
          reject(new Error('Create call timeout'))
        }, 5000)

        const off = this.eventLogContainer.eventLog.on('RoomCreatedEvent', async (event) => {
          console.log('RoomCreatedEvent', event)
          if (formatAddress(event.creator) === formatAddress(account.address)) {
            clearTimeout(timeout)
            off() // Stop listening
            resolve(
              new URLSearchParams({
                caller: event.creator,
                callee: receiver,
                roomId: `0x${event.roomId}`,
                address: account.address,
                sessionId: sessionId,
                type: 'direct'
              }).toString()
            )
          }
        })
      })
      await this.mettingContract.createRoom({
        from: account.address,
        inputData: {
          name: `Call from ${account.name}`,
          receiver,
          meet: false
        }
      })
      const query = await promise
      await Promise.race([
        sendCommand('startCallRTC', {
          query: query
        }),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ])
    } catch (error) {
      console.error('[CallService] Error creating call:', error)
      throw error
    }
  }

  async acceptCall(
    account: Account,
    roomId: string,
    caller: string,
    callee: string
  ): Promise<void> {
    try {
      const sessionId = Math.random().toString(36).substring(7)
      console.log('[CallService] Accepting call...', account)
      await sendCommand('startCallRTC', {
        query: new URLSearchParams({
          caller: caller,
          callee: callee,
          roomId: `0x${roomId}`,
          address: account.address,
          sessionId: sessionId,
          type: 'direct'
        }).toString()
      })
    } catch (error) {
      console.error('[CallService] Error accepting call:', error)
      throw error
    }
  }

  async handleCallReceived(account: Account, caller: string) {
    try {
      const userContractAddress = await this.factoryContract.getUserContract({
        from: account.address,
        inputData: {
          user: caller
        }
      })
      console.log('User contract address:', userContractAddress)
      if (!userContractAddress) throw new Error('User contract not found')
      const userProfile = await this.userContract.userProfile({
        from: account.address,
        to: userContractAddress
      })
      console.log('User profile:', userProfile)
      return userProfile
    } catch (error) {
      console.error('[CallService] Error handling call received:', error)
      throw error
    }
  }
}
