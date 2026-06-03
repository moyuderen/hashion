import type SparkMD5 from 'spark-md5'
import type { HashCallback, HashParameters } from '../types/hash'

type SparkMD5Type = typeof SparkMD5

let sparkMD5Promise: Promise<SparkMD5Type> | null = null

function loadSparkMD5(): Promise<SparkMD5Type> {
  if (!sparkMD5Promise) {
    sparkMD5Promise = import('spark-md5').then((m) => m.default as SparkMD5Type)
  }
  return sparkMD5Promise
}

export class Spark {
  static pluginName = 'hash-plugin'
  static name = 'spark-md5'
  name: string

  constructor() {
    this.name = Spark.name
  }

  computeHash(data: HashParameters, callback: HashCallback) {
    const controller = new AbortController()
    this.runHash(data, callback, controller.signal).catch(() => {
      /* unhandled rejection guard */
    })
    return { abort: () => controller.abort() }
  }

  private async runHash(
    data: HashParameters,
    callback: HashCallback,
    signal: AbortSignal
  ) {
    const { file, chunkSize } = data

    let SparkMD5: SparkMD5Type
    try {
      SparkMD5 = await loadSparkMD5()
    } catch {
      callback(
        new Error(
          'spark-md5 is required for the Spark plugin. Please install it: npm install spark-md5'
        ),
        { progress: 0 }
      )
      return
    }

    if (signal.aborted) {
      callback(new Error('Hash calculation cancelled'), { progress: 0 })
      return
    }

    let ended = false
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    const totalChunks = Math.ceil(file.size / chunkSize)
    const startTime = Date.now()
    let currentChunk = 0

    signal.addEventListener('abort', () => {
      if (ended) return
      fileReader.abort()
      callback(new Error('Hash calculation cancelled'), { progress: 0 })
    })

    fileReader.onload = function (e) {
      if (signal.aborted) return
      spark.append(e.target?.result as ArrayBuffer)
      currentChunk++
      if (currentChunk < totalChunks) {
        loadNext()
        callback(null, { progress: (currentChunk / totalChunks) * 100 })
      } else {
        ended = true
        callback(null, {
          hash: spark.end(),
          time: Date.now() - startTime,
          progress: 100
        })
      }
    }

    fileReader.onerror = function () {
      if (signal.aborted) return
      callback(new Error('File read failed'), { progress: 0 })
    }

    function loadNext() {
      if (signal.aborted) return
      const start = currentChunk * chunkSize
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize
      fileReader.readAsArrayBuffer(file.slice(start, end))
    }

    loadNext()
  }
}
