import { deleteMessageV2 } from './delete-message-v2.abi'
import { editMessage } from './edit-message.abi'
import { getFullInbox } from './get-full-Inbox.abi'
import { getMessageById } from './get-message-by-id.abi'
import { getProcessedP2PMessages } from './get-processed-p2p-messages.abi'
import { meetingFactoryAddress } from './meeting-factory-address'
import { publicKey } from './publicKey.abi'
import { reactToMessage } from './reactToMessage.abi'
import { sendDataChannel } from './send-data-channel.abi'
import { sendMessage } from './send-message.abi'
import { setMeetingFactory } from './set-meeting-factory.abi'
import { userProfile } from './user-profile.abi'

export const userAbi = {
  userProfile,
  getFullInbox,
  publicKey,
  getProcessedP2PMessages,
  sendMessage,
  reactToMessage,
  editMessage,
  deleteMessageV2,
  sendDataChannel,
  getMessageById,
  setMeetingFactory,
  meetingFactoryAddress
}
