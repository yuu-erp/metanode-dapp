export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs = 1000
): Promise<T | undefined> {
  return Promise.race([
    fn(),
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), timeoutMs))
  ])
}
