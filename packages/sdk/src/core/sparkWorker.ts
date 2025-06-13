import type { HashCallback, HashParameters } from '../types/hash'
import { workerCode } from './workerCode'

const isSupportWorker = !!window.Worker

export class SparkWorker {
  static pluginName = 'hash-plugin'
  static name = 'sparkMd5Webworker'
  name: string

  constructor() {
    this.name = 'sparkMd5Webworker'
  }
  computeHash(data: HashParameters, callback: HashCallback) {
    if (!isSupportWorker) {
      callback(new Error('Web worker is not supported'), { progress: 0 })
      return
    }
    console.log('In Web Worker')

    const { file, chunkSize } = data
    const workUrl = URL.createObjectURL(new Blob([workerCode]))
    const worker = new Worker(workUrl)

    const controller = new AbortController()
    const signal = controller.signal

    const close = () => {
      worker.postMessage({ type: 'DONE' })
      worker.terminate()
    }

    signal.addEventListener('abort', () => worker.postMessage({ type: 'CANCELED' }))

    worker.postMessage({ file, chunkSize })

    worker.onmessage = (e) => {
      const { error, progress, hash, time } = e.data
      if (error) {
        callback(error, { progress: 0 })
        close()
        return
      }
      if (progress === 100) {
        close()
        callback(null, { progress, hash, time })
        URL.revokeObjectURL(workUrl)
        return
      }
      callback(error, { progress })
    }

    return {
      abort: () => controller.abort()
    }
  }
}
