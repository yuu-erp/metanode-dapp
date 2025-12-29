import mitt from 'mitt'

type ChatEvents = {
  'message:messageReceived': {}
}

export const chatEmitter = mitt<ChatEvents>()
