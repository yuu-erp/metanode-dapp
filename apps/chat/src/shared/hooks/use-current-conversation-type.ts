import { useParams } from '@tanstack/react-router'

export function useCurrentConversationType() {
  const { type } = useParams({ strict: false })

  return type ?? ('p2p' as any)
}
