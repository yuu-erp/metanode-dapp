import { toast } from 'sonner'

export function onError(error: Error) {
  toast.error(error.message)
}
