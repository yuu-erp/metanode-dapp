import { SystemCore } from '@metanodejs/system-core'
import { createChatModule } from '@repo/chat-2'
import * as coreFns from '@metanodejs/system-core'
import { queryClient } from '@/shared/lib/react-query'
import { container } from '@/container'

const meetingAddress = import.meta.env.VITE_MEETING
const factoryAddress = import.meta.env.VITE_FACTORY

export const chatClient = createChatModule({
  core: SystemCore,
  contractAddresses: {
    meeting: meetingAddress,
    factory: factoryAddress
  },
  coreFns: {
    ...coreFns,
    startCallRTCV2: (query: string) => coreFns.sendCommand('startCallRTC', { query })
  },
  queryClient: queryClient,
  eventLogs: container.eventLogContainer.eventLog as any,
  decodeAbi: container.eventLogContainer.decodeAbi
})
