export function detectNameFromWalletName(walletName?: string): {
  firstName: string
  lastName: string
} {
  if (!walletName) {
    return { firstName: 'User', lastName: '' }
  }

  const cleaned = walletName.replace(/[^a-zA-Z\s_-]/g, ' ').trim()

  const parts = cleaned.split(/[\s_-]+/).filter(Boolean)

  if (parts.length === 0) {
    return { firstName: 'User', lastName: '' }
  }

  if (parts.length === 1) {
    return {
      firstName: capitalize(parts[0]),
      lastName: ''
    }
  }

  return {
    firstName: capitalize(parts[0]),
    lastName: capitalize(parts[parts.length - 1])
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
