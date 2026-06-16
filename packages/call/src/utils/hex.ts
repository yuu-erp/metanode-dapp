export function hexToString(hex: string): string {
  // bỏ khoảng trắng nếu có
  hex = hex.replace(/\s+/g, '')

  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16))
  }

  return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
}

export function stringToHex(str: any): string {
  const bytes = new TextEncoder().encode(str) // chuyển string thành Uint8Array
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0')) // mỗi byte -> hex 2 ký tự
    .join('')
}

export function encodeDataToBackend(data: any) {
  return stringToHex(JSON.stringify(data))
}

export function decodeDataFromBackend(data: string) {
  try {
    console.log('datafrombackend 1', data)
    const d1 = hexToString(data)
    console.log('datafrombackend 2', { d1, t: typeof d1 })

    return JSON.parse(d1)
  } catch (error) {
    throw error
  }
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return address.toLowerCase().replace(/^0x/, '')
}

export function compareAddress(add1: string, add2: string) {
  return formatAddress(add1) === formatAddress(add2)
}
