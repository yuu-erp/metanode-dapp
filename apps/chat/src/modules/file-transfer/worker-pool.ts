/**
 * worker-pool.ts
 * ==============
 * Quản lý pool of Web Workers cho file processing
 * Optimize: reuse workers thay vì tạo mới mỗi lần
 */

/**
 * WorkerPool
 * Manages a pool of workers để reuse & optimize performance
 */
export class WorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private pendingTasks: Array<{
    resolve: (worker: Worker) => void
    reject: (error: Error) => void
  }> = []

  constructor(
    private workerUrl: URL,
    private poolSize = 2
  ) {
    this.initialize()
  }

  /**
   * Initialize pool với set số workers
   */
  private initialize(): void {
    try {
      for (let i = 0; i < this.poolSize; i++) {
        try {
          const worker = new Worker(this.workerUrl, { type: 'module' })
          this.workers.push(worker)
          this.availableWorkers.push(worker)
        } catch (error) {
          console.warn(`Failed to create worker ${i}:`, error)
          // Continue với số workers ít hơn
        }
      }

      if (this.workers.length === 0) {
        console.warn('No workers available in pool, fallback to main thread')
      }
    } catch (error) {
      console.warn('Failed to initialize worker pool:', error)
    }
  }

  /**
   * Acquire worker từ pool
   * Wait nếu không có available
   */
  async acquire(): Promise<Worker> {
    if (this.availableWorkers.length > 0) {
      const worker = this.availableWorkers.pop()!
      return worker
    }

    // Queue request nếu tất cả workers đang busy
    return new Promise((resolve, reject) => {
      this.pendingTasks.push({ resolve, reject })
    })
  }

  /**
   * Release worker về pool
   */
  release(worker: Worker): void {
    const pendingTask = this.pendingTasks.shift()

    if (pendingTask) {
      // Assign worker tới pending task
      pendingTask.resolve(worker)
    } else {
      // Return về available pool
      this.availableWorkers.push(worker)
    }
  }

  /**
   * Get pool size
   */
  getSize(): number {
    return this.workers.length
  }

  /**
   * Get available workers count
   */
  getAvailableCount(): number {
    return this.availableWorkers.length
  }

  /**
   * Terminate all workers
   */
  destroy(): void {
    // Reject all pending tasks
    this.pendingTasks.forEach(({ reject }) => {
      reject(new Error('Worker pool destroyed'))
    })
    this.pendingTasks = []

    // Terminate all workers
    this.workers.forEach((worker) => {
      try {
        worker.terminate()
      } catch (error) {
        console.warn('Error terminating worker:', error)
      }
    })

    this.workers = []
    this.availableWorkers = []
  }
}
