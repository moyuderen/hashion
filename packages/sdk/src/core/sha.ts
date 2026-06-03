import type { HashCallback, HashParameters } from '../types/hash'

export type ShaAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export type ShaOptions = {
  algorithm?: ShaAlgorithm
}

const MAX_MEMORY_SIZE = 500 * 1024 * 1024 // 500MB

export class Sha {
  static pluginName = 'hash-plugin'
  static name = 'SHA'
  algorithm: ShaAlgorithm
  name: string

  constructor(options?: ShaOptions) {
    this.algorithm = options?.algorithm || 'SHA-256'
    this.name = 'SHA'
  }

  computeHash(data: HashParameters, callback: HashCallback) {
    const { file, chunkSize } = data
    const fileSize = file.size

    if (fileSize > MAX_MEMORY_SIZE) {
      callback(
        new Error(`File too large for SHA: ${fileSize} bytes exceeds ${MAX_MEMORY_SIZE} limit`),
        { progress: 0 }
      )
      return { abort: () => {} }
    }

    const reader = new FileReader()
    const startTime = Date.now()
    const totalChunks = Math.ceil(fileSize / chunkSize)
    let currentChunk = 0
    let ended = false
    let offset = 0

    const totalBuffer = new ArrayBuffer(fileSize)
    const view = new Uint8Array(totalBuffer)

    const controller = new AbortController()
    const signal = controller.signal
    signal.addEventListener('abort', () => {
      if (ended) return
      reader.abort()
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
        view.set(chunk, offset)
        offset += chunk.length
        currentChunk++

        if (currentChunk < totalChunks) {
          readNextChunk()
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
        callback(
          error instanceof Error ? error : new Error('Hash calculation failed'),
          { progress: 0 }
        )
      }
    }

    reader.onerror = () => {
      if (signal.aborted) return
      callback(new Error('File read failed'), { progress: 0 })
    }

    readNextChunk()

    return {
      abort: () => controller.abort()
    }
  }
}
