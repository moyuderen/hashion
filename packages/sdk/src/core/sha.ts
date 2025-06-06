import type { HashCallback, HashParameters } from '../types/hash'

export type ShaAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export type ShaOptions = {
  algorithm: ShaAlgorithm
}

export class Sha {
  static pluginName = 'hash-plugin'
  static name = 'SHA'
  algorithm: ShaAlgorithm
  name: string

  constructor(options: ShaOptions) {
    this.algorithm = options?.algorithm || 'SHA-256'
    this.name = 'SHA'
  }

  computeHash(data: HashParameters, callback: HashCallback) {
    const { file, chunkSize } = data
    const fileSize = file.size
    const reader = new FileReader()
    const startTime = Date.now()
    const totalChunks = Math.ceil(fileSize / chunkSize)
    let currentChunk = 0
    let ended = false

    let offset = 0

    // 分配初始缓冲区（避免动态扩展）
    const totalBuffer = new ArrayBuffer(fileSize)
    const view = new Uint8Array(totalBuffer)

    // 创建 AbortController 用于中断
    const controller = new AbortController()
    const signal = controller.signal
    signal.addEventListener('abort', () => {
      if (ended) return
      reader.abort() // 中断 FileReader
      callback(new Error('Hash calculation cancelled'), { progress: 0 })
    })

    function readNextChunk() {
      if (signal.aborted) return

      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, fileSize)
      const blob = file.slice(start, end)

      reader.readAsArrayBuffer(blob)
    }

    reader.onload = async (e) => {
      if (signal.aborted) return
      try {
        const chunk = new Uint8Array(e.target?.result as ArrayBuffer)
        view.set(chunk, offset) // 将分片数据写入总缓冲区
        offset += chunk.length
        currentChunk++

        if (currentChunk < totalChunks) {
          readNextChunk() // 继续读取下一分片
          callback(null, {
            progress: (currentChunk / totalChunks) * 100
          })
        } else {
          const hashBuffer = await crypto.subtle.digest(this.algorithm, totalBuffer)
          const hash = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')

          ended = true
          callback(null, {
            hash,
            time: Date.now() - startTime,
            progress: 100
          })
        }
      } catch (error) {
        callback(error, { progress: 0 })
      }
    }

    reader.onerror = (error) => {
      if (signal.aborted) return
      console.warn('SHA-256: Hash calculation error')
      callback(error, { progress: 0 })
    }

    // 开始读取第一分片
    readNextChunk()

    return {
      abort: () => controller.abort()
    }
  }
}
