import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator'

function normalizeWalletName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10)
}

export function generateUsernameFromWalletName(walletName: string) {
  const base = normalizeWalletName(walletName) || 'user'

  const randomPart = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '',
    length: 2
  })

  return `${base}_${randomPart}`.toLowerCase()
}

const MAX_USERNAME_ATTEMPTS = 5

export async function generateAvailableUsername(
  walletName: string,
  address: string,
  isUsernameTaken: (address: string, username: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt++) {
    const username = generateUsernameFromWalletName(walletName)

    const exists = await isUsernameTaken(address, username)
    if (!exists) {
      return username
    }
  }

  throw new Error('Cannot generate available username')
}
