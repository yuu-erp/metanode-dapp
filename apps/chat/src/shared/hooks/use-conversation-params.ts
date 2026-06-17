import { useParams } from '@tanstack/react-router'

export function useConversationParams() {
  const { type, id } = useParams({ strict: false })

  return {
    id: id ?? '',
    type: type ?? ('p2p' as any)
  }
}
