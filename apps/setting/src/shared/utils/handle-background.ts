export function handleBackground(value: string, fallback?: string): string {
  if (value.startsWith('linear-gradient') || value.startsWith('#')) {
    return value
  } else if (value.startsWith('image://') || value.startsWith('https://')) {
    return `url(${encodeURI(value)}) no-repeat center center / cover`
  } else if (fallback) {
    return `url(${fallback}) no-repeat center center / cover`
  } else {
    return ''
  }
}
