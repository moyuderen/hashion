import SparkMD5 from 'spark-md5'
import type { HashCallback, HashParameters } from '../types/hash'

const slice =
  File.prototype.slice || (File.prototype as any).mozSlice || (File.prototype as any).webkitSlice

export class Spark {
  static pluginName = 'hash-plugin'
  static name = 'spark-md5'
  name: string

  constructor() {
    this.name = 'spark-md5'
  }

  computeHash(data: HashParameters, callback: HashCallback) {
    const { file, chunkSize } = data
    let ended = false
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    const totalChunks = Math.ceil(file.size / chunkSize)
    const startTime = Date.now()
    let currentChunk = 0

    const controller = new AbortController()
    const signal = controller.signal
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
        callback(null, {
          progress: (currentChunk / totalChunks) * 100
        })
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
      fileReader.readAsArrayBuffer(slice.call(file, start, end))
    }

    loadNext()

    return {
      abort: () => controller.abort()
    }
  }
}
