export function getBundleId() {
  const searchParams = new URLSearchParams(window.location.search)
  const hash = window.location.hash
  // Ưu tiên: Nếu windowId có trong window.location.search
  if (searchParams.has('bundleId')) {
    return searchParams.get('bundleId')
  }
  // Nếu không có, kiểm tra phần hash (nếu có chứa query string)
  if (hash.includes('?')) {
    const hashQuery = hash.split('?')[1]
    const hashParams = new URLSearchParams(hashQuery)
    if (hashParams.has('bundleId')) {
      return hashParams.get('bundleId')
    }
  }
  // Nếu không tìm thấy
  return null
}

export function pushNoti(title: string, message: string) {
  //@ts-ignore
  if (!window?.electronAPI?.sendMessage) return
  //@ts-ignore
  window.electronAPI.sendMessage(
    'native',
    JSON.stringify({
      command: 'pushNotification',
      value: {
        title,
        message,
        bundleId: getBundleId()
      }
    })
  )
}
