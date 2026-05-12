import { queryClient, queryKeys } from '@/shared'
import { createWallet } from '@metanodejs/system-core'

export async function handleCreateWallet() {
  //@ts-ignore
  await createWallet({})
  queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all })
}
