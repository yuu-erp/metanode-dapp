type Task<T> = () => Promise<T> | T

export class WorkerQueue {
  #concurrency: number
  #running = 0
  #queue: Array<() => void> = []

  #idleResolvers: Array<() => void> = []

  constructor(concurrency: number) {
    if (concurrency < 1) {
      throw new Error('concurrency must be >= 1')
    }

    this.#concurrency = concurrency
  }

  get running() {
    return this.#running
  }

  get pending() {
    return this.#queue.length
  }

  get size() {
    return this.#running + this.#queue.length
  }

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = async () => {
        this.#running++

        try {
          const result = await task()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.#running--

          this.#drain()

          if (this.#running === 0 && this.#queue.length === 0) {
            this.#resolveIdle()
          }
        }
      }

      this.#queue.push(run)

      this.#drain()
    })
  }

  async onIdle(): Promise<void> {
    if (this.#running === 0 && this.#queue.length === 0) {
      return
    }

    return new Promise<void>((resolve) => {
      this.#idleResolvers.push(resolve)
    })
  }

  #drain() {
    while (this.#running < this.#concurrency && this.#queue.length > 0) {
      const task = this.#queue.shift()!
      task()
    }
  }

  #resolveIdle() {
    const resolvers = this.#idleResolvers

    this.#idleResolvers = []

    for (const resolve of resolvers) {
      resolve()
    }
  }
}
