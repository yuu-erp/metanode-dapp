/** File cố định dùng cho E2E gửi ảnh (giống chọn file trên domain Send file). */
export const E2E_SAMPLE_FILE_URL =
  'https://gitlab.com/QuangFiIt/upload_app/-/raw/main/top-web-usa-logo/wallet.png'

/** 1×1 PNG — fallback khi GitLab/CORS chặn fetch trên localhost. */
const FALLBACK_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

function fallbackWalletPng(): File {
  const binary = atob(FALLBACK_PNG_BASE64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], 'wallet.png', { type: 'image/png' })
}

export async function fetchE2eSampleFile(
  url = E2E_SAMPLE_FILE_URL,
  fileName = 'wallet.png',
): Promise<File> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Fetch file thất bại HTTP ${res.status}: ${url}`)
    }
    const blob = await res.blob()
    const type = blob.type || 'image/png'
    return new File([blob], fileName, { type })
  } catch (err) {
    console.warn('[pure-e2e] fetch ảnh mẫu lỗi, dùng PNG fallback 1×1', err)
    return fallbackWalletPng()
  }
}
