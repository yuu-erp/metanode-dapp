export { handleBackground } from './handle-background'

export function getAvatarFallback(name?: string, max = 2): string {
  if (!name) return '?'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export const isVisibleProfile = (p: { isHidden: number | boolean }) =>
  p.isHidden === 0 || p.isHidden === false
