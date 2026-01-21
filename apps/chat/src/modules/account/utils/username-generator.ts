function generateRandomAlphanumeric(length = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

function normalizeWalletName(name: string) {
  return (
    name
      .toLowerCase()
      // bỏ dấu tiếng Việt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // chỉ giữ a-z0-9
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 10)
  )
}

export function generateUsernameFromWalletName(walletName: string) {
  const base = normalizeWalletName(walletName) || 'user'

  const randomPart = generateRandomAlphanumeric(7)

  return `${base}_${randomPart}`
}

const MAX_USERNAME_ATTEMPTS = 5

export async function generateAvailableUsername(
  walletName: string,
  address: string,
  isUsernameTaken: (payload: { from: string; inputData: { _username: string } }) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt++) {
    const username = generateUsernameFromWalletName(walletName)

    const exists = await isUsernameTaken({ from: address, inputData: { _username: username } })
    if (!exists) {
      return username
    }
  }

  throw new Error('Cannot generate available username')
}
