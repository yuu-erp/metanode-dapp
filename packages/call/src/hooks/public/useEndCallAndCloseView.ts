import { enCallAndCloseView } from '~/services'
import { useCallStore } from '~/stores'

export function useEndCallAndCloseView() {
  const loading = useCallStore((s) => s.ending)

  return { enCallAndCloseView, loading }
}
