type Task<T = any> = () => Promise<T> | T
type Priority = 'high' | 'medium' | 'low'

export class AsyncPriorityQueue {
  private highQueue: Array<() => Promise<void>> = []
  private mediumQueue: Array<() => Promise<void>> = []
  private lowQueue: Array<() => Promise<void>> = []
  private isRunning = false

  private idleResolvers: Array<() => void> = []

  /**
   * Add task to queue
   */
  add<T>(task: Task<T>, priority: Priority = 'low'): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await task()
          resolve(result)
        } catch (err) {
          reject(err)
        }
      }

      if (priority === 'high') {
        this.highQueue.push(wrappedTask)
      } else if (priority === 'medium') {
        this.mediumQueue.push(wrappedTask)
      } else {
        this.lowQueue.push(wrappedTask)
      }

      this.run()
    })
  }

  /**
   * Internal runner
   */
  private async run() {
    if (this.isRunning) return
    this.isRunning = true

    while (this.highQueue.length || this.mediumQueue.length || this.lowQueue.length) {
      const nextTask = this.highQueue.shift() ?? this.mediumQueue.shift() ?? this.lowQueue.shift()

      if (!nextTask) break

      await nextTask()
    }

    this.isRunning = false
    this.resolveIdle()
  }

  /**
   * Wait until queue + current task finished
   */
  waitForIdle(): Promise<void> {
    if (
      !this.isRunning &&
      !this.highQueue.length &&
      !this.mediumQueue.length &&
      !this.lowQueue.length
    ) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.idleResolvers.push(resolve)
    })
  }

  /**
   * Clear only low priority queue
   */
  clearLow() {
    this.lowQueue = []
  }

  /**
   * Clear all queues (not cancel current running task)
   */
  clearAll() {
    this.highQueue = []
    this.mediumQueue = []
    this.lowQueue = []
  }

  private resolveIdle() {
    if (this.isRunning) return
    if (this.highQueue.length || this.lowQueue.length || this.mediumQueue.length) return

    this.idleResolvers.forEach((r) => r())
    this.idleResolvers = []
  }
}

export const asyncPriorityQueue = new AsyncPriorityQueue()

export function makePiority<Arg, Return>(
  cb: (arg: Arg) => Return | Promise<Return>,
  piority: Priority
): (arg: Arg) => Promise<Return> {
  return (arg: Arg) => {
    return asyncPriorityQueue.add(() => cb(arg), piority)
  }
}
