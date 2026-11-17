export function parseIfJson(data: unknown) {
  if (typeof data !== 'string') return data

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

export function coerceBooleanStrings<T>(data: T): T {
  if (data === 'true') return true as T
  if (data === 'false') return false as T

  if (Array.isArray(data)) {
    return data.map((v) => coerceBooleanStrings(v)) as T
  }

  if (data && typeof data === 'object') {
    const result: any = {}
    for (const key in data) {
      result[key] = coerceBooleanStrings((data as any)[key])
    }
    return result
  }

  return data
}
