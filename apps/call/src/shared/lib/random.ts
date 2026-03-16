export function randomBytes32(): string {
  let result = '0x'

  for (let i = 0; i < 32; i++) {
    const byte = Math.floor(Math.random() * 256)
    result += byte.toString(16).padStart(2, '0')
  }

  return result
}
