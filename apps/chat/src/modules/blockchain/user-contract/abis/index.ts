import { editMessage } from './edit-message.abi'
import { getFullInbox } from './get-full-Inbox.abi'
import { getProcessedP2PMessages } from './get-processed-p2p-messages.abi'
import { publicKey } from './publicKey.abi'
import { reactToMessage } from './reactToMessage.abi'
import { sendMessage } from './send-message.abi'
import { userProfile } from './user-profile.abi'

export const userAbi = {
  userProfile,
  getFullInbox,
  publicKey,
  getProcessedP2PMessages,
  sendMessage,
  reactToMessage,
  editMessage
}
