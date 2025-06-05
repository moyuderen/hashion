// import SparkMD5 from 'spark-md5'
import type { HashCallback, HashParameters } from '../types/hash'

const slice =
  File.prototype.slice || (File.prototype as any).mozSlice || (File.prototype as any).webkitSlice

export class Spark {
  static pluginName = 'hash-plugin'
  static name = 'spark-md5'

  async computeHash(data: HashParameters, callback: HashCallback) {
    const { file, chunkSize } = data
    let spark: any
    let SparkMD5: any
    let ended = false

    try {
      // @ts-expect-error
      SparkMD5 = (await import('spark-md5')).default
    } catch {
      const errorMessage = `SparkMd5Plugin: Please run > npm install spark-md5, https://www.npmjs.com/package/spark-md5`
      console.error(errorMessage)
      callback(new Error(errorMessage), { progress: 0 })
      return
    }
    spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    const totalChunks = Math.ceil(file.size / chunkSize)
    const startTime = Date.now()
    let currentChunk = 0
    // 创建 AbortController 用于中断
    const controller = new AbortController()
    const signal = controller.signal
    signal.addEventListener('abort', () => {
      if (ended) return
      fileReader.abort() // 中断 FileReader
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
        return
      }
    }
    fileReader.onerror = function (error) {
      if (signal.aborted) return
      console.warn('spark-md5: Hash calculation error')
      callback(error, { progress: 0 })
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
