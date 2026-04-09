export type ErrorHandler = {
  onError?: (error: any) => void

  onFatal?: (error: any) => void
}

const errorHandlers: ErrorHandler = {}

export function setErrorHandler(handlers: Partial<ErrorHandler>) {
  Object.assign(errorHandlers, handlers)
}

export function onError(error: any, name = '') {
  console.log(`[onError] - function "${name}" error`, error)
  errorHandlers.onError?.(error)
  throw new Error(error)
}

export function onFatal(error: any, name = ''): never {
  console.log(`[onFatal] - function "${name}" error`, error)
  errorHandlers.onFatal?.(error)
  throw new Error(error)
}

export function onLogError(error: any) {
  console.log('[onError] - error', error)
}
