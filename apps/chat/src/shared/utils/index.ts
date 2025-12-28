import { images } from '@/assets/images'

export const fulfilledPromises = <T extends Promise<any>>(promises: T[]) =>
  Promise.allSettled(promises).then((results) =>
    results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<Awaited<T>>).value)
  )

export function handleBackgroundWallet(string: string) {
  if (string.startsWith('linear-gradient')) {
    return string
  } else if (string.startsWith('image://') || string.startsWith('https://')) {
    return `url(${encodeURI(string)}) no-repeat center center / cover`
  } else {
    return `url(${images.defaultWalletBg}) no-repeat center center / cover`
  }
}
