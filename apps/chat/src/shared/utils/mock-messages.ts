import type { Message } from '@/modules/message'

const BASE_ACCOUNT_ID = '0x123'
const BASE_CONVERSATION_ID = '0x456'
const BASE_SENDER = '0x123'
const BASE_RECIPIENT = '0x456'
const BASE_TIMESTAMP = Date.now()

export const MOCK_TEXT_MESSAGE: Extract<Message, { type: 'text' }> = {
  type: 'text',
  content: 'Hello! This is a mock text message with a link: https://google.com',
  accountId: BASE_ACCOUNT_ID,
  conversationId: BASE_CONVERSATION_ID,
  sender: BASE_SENDER,
  recipient: BASE_RECIPIENT,
  timestamp: BASE_TIMESTAMP,
  status: 'read'
}

export const MOCK_STICKER_MESSAGE: Extract<Message, { type: 'sticker' }> = {
  type: 'sticker',
  stickerId: '1', // Assuming sticker ID exists
  accountId: BASE_ACCOUNT_ID,
  conversationId: BASE_CONVERSATION_ID,
  sender: BASE_SENDER,
  recipient: BASE_RECIPIENT,
  timestamp: BASE_TIMESTAMP,
  status: 'read'
}

export const MOCK_FILE_MESSAGE: Extract<Message, { type: 'file' }> = {
  type: 'file',
  fileId: 'file-123',
  fileName: 'design-specification.pdf',
  mimeType: 'application/pdf',
  size: 2450000, // ~2.45 MB
  filePath: 'file-123',
  accountId: BASE_ACCOUNT_ID,
  conversationId: BASE_CONVERSATION_ID,
  sender: BASE_SENDER,
  recipient: BASE_RECIPIENT,
  timestamp: BASE_TIMESTAMP,
  status: 'sent'
}

export const MOCK_VOICE_MESSAGE: Extract<Message, { type: 'voice' }> = {
  type: 'voice',
  fileId: 'voice-123',
  duration: 45, // 45 seconds
  mimeType: 'audio/webm',
  accountId: BASE_ACCOUNT_ID,
  conversationId: BASE_CONVERSATION_ID,
  sender: BASE_SENDER,
  recipient: BASE_RECIPIENT,
  timestamp: BASE_TIMESTAMP,
  status: 'read'
}

export const MOCK_LOCATION_MESSAGE: Extract<Message, { type: 'location' }> = {
  type: 'location',
  latitude: 10.762622,
  longitude: 106.660172,
  address: 'Ho Chi Minh City, Vietnam',
  accountId: BASE_ACCOUNT_ID,
  conversationId: BASE_CONVERSATION_ID,
  sender: BASE_SENDER,
  recipient: BASE_RECIPIENT,
  timestamp: BASE_TIMESTAMP,
  status: 'read'
}

export const ALL_MOCK_MESSAGES: Message[] = [
  MOCK_TEXT_MESSAGE,
  MOCK_STICKER_MESSAGE,
  MOCK_FILE_MESSAGE,
  MOCK_VOICE_MESSAGE,
  MOCK_LOCATION_MESSAGE
]
