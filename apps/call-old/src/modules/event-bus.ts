import mitt from 'mitt'

export type AppEvents = {
  'connect-local': string
  'context.update': any
  'local.pc.state': {
    local: string
    remote: string
  }
  'stream:': {}
}

export const eventBus = mitt<AppEvents>()
