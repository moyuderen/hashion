import type { HashCallback, HashParameters } from '../types/hash'
import { workerCode } from './workerCode'

let cachedWorkerUrl: string | null = null

function getWorkerUrl(): string {
  if (!cachedWorkerUrl) {
    cachedWorkerUrl = URL.createObjectURL(new Blob([workerCode]))
  }
  return cachedWorkerUrl
}

function isWorkerSupported(): boolean {
  return typeof window !== 'undefined' && !!window.Worker
}

export class SparkWorker {
  static pluginName = 'hash-plugin'
  static name = 'sparkMd5Webworker'
  name: string

  constructor() {
    this.name = SparkWorker.name
  }

  computeHash(data: HashParameters, callback: HashCallback) {
    if (!isWorkerSupported()) {
      callback(new Error('Web Worker is not supported'), { progress: 0 })
      return { abort: () => {} }
    }

    const { file, chunkSize } = data
    const worker = new Worker(getWorkerUrl())

    const controller = new AbortController()
    const signal = controller.signal

    const cleanup = () => {
      worker.terminate()
    }

    signal.addEventListener('abort', () => {
      worker.postMessage({ type: 'CANCELED' })
      cleanup()
      callback(new Error('Hash calculation cancelled'), { progress: 0 })
    })

    worker.postMessage({ file, chunkSize })

    worker.onmessage = (e) => {
      const { error, progress, hash, time } = e.data
      if (error) {
        cleanup()
        callback(error, { progress: 0 })
        return
      }
      if (progress === 100) {
        cleanup()
        callback(null, { progress, hash, time })
        return
      }
      callback(null, { progress })
    }

    return {
      abort: () => controller.abort()
    }
  }
}
