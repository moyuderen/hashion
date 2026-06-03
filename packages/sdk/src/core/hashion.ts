import type {
  HashParameters,
  HashCallbackData,
  HashPromiseData,
  HashPluginConstructor,
  HashPluginInstance,
} from '../types/hash'

export class Hashion {
  hashCarrier: HashPluginInstance
  hashionName: string

  constructor(plugin: HashPluginConstructor, options?: Record<string, unknown>) {
    this.hashionName = plugin.name
    this.hashCarrier = new plugin(options)
  }

  computedHash({ file, chunkSize }: HashParameters, callback?: (data: HashCallbackData) => void) {
    if (!file) throw new Error('file is required')
    if (!chunkSize || chunkSize <= 0) throw new Error('chunkSize must be a positive number')

    let abortComputedHash: { abort?: () => void; reject: (reason: Error) => void } | null = null

    const promise: Promise<HashPromiseData> = new Promise((resolve, reject) => {
      Promise.resolve(
        this.hashCarrier.computeHash(
          {
            file,
            chunkSize
          },
          (error: Error | null, { progress, hash, time }: HashCallbackData) => {
            if (error) {
              reject(error)
              return
            }
            if (progress === 100) {
              resolve({ progress, hash, time } as HashPromiseData)
            }
            callback && callback({ progress })
          }
        )
      ).then((result) => {
        abortComputedHash = { abort: result?.abort, reject }
      })
    })

    return {
      promise,
      abort: () => {
        if (!abortComputedHash) return
        if (abortComputedHash.abort) abortComputedHash.abort()
        abortComputedHash.reject(new Error('Hash calculation cancelled'))
        abortComputedHash = null
      }
    }
  }
}
