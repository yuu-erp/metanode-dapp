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
  ['#ff516a', '#ff885e'], // Đỏ
  ['#ffa85c', '#ffcd6a'], // Cam
  ['#665fff', '#82b1ff'], // Xanh dương
  ['#54cb68', '#a0de7e'], // Xanh lá
  ['#4acccd', '#00ffab'], // Lục lam (Cyan)
  ['#2a9ef1', '#72d5fd'], // Xanh biển sáng
  ['#d669ed', '#e0a2f3'], // Hồng/Tím
  ['#f43f5e', '#ec4899'], // rose-pink
  ['#6366f1', '#3b82f6'], // indigo-blue
  ['#14b8a6', '#0ea5e9'], // teal-sky
  ['#f59e0b', '#ef4444'], // amber-red
  ['#8b5cf6', '#a855f7'] // violet-purple
]

export function getTelegramGradient(id: string | number): string {
  if (!id) return 'linear-gradient(135deg, #efeff4, #dad9e0)'

  // Telegram thường dùng ID người dùng để lấy index thay vì hash tên
  const idNum = typeof id === 'number' ? id : hashCode(id.toString())
  const index = Math.abs(idNum) % telegramGradients.length
  const [color1, color2] = telegramGradients[index]

  // Telegram sử dụng góc 135 độ cho gradient ảnh đại diện
  return `linear-gradient(135deg, ${color1}, ${color2})`
}
