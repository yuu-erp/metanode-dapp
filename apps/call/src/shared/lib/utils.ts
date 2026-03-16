export const fulfilledPromises = <T extends Promise<any>>(promises: T[]) =>
  Promise.allSettled(promises).then((results) =>
    results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<Awaited<T>>).value)
  )

export function formatAddress(address: string): string {
  if (!address) return ''
  return address.toLowerCase().replace(/^0x/, '')
}
