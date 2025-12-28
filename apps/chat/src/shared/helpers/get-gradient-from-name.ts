// Hash tên thành số
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Gradient giống Telegram, đầy đủ màu
const telegramGradients: [string, string][] = [
  ['#2AABEE', '#0077FF'], // xanh dương
  ['#00C851', '#007E33'], // xanh lá
  ['#FFBB33', '#FF8800'], // vàng → cam sáng
  ['#9933CC', '#660099'], // tím
  ['#FF4444', '#CC0000'], // đỏ
  ['#FF8800', '#FF5500'], // cam
  ['#FF66CC', '#FF3399'] // hồng
]

export function getTelegramGradient(name: string): string {
  if (!name) return 'linear-gradient(45deg, #ccc, #eee)'

  const hash = hashCode(name)
  const index = hash % telegramGradients.length
  const [color1, color2] = telegramGradients[index]

  return `linear-gradient(135deg, ${color1}, ${color2})`
}
