import type { HashParameters, HashCallbackData } from '../types/hash'

export class Hashion {
  hashCarrier: any
  hashionName: string

  constructor(plugin: any, options?: Record<string, any>) {
    this.hashionName = plugin.name
    this.hashCarrier = new plugin(options)
  }

  computedHash({ file, chunkSize }: HashParameters, callback: (data: HashCallbackData) => void) {
    let abortComputedHash: any

    const promise = new Promise((resolve, reject) => {
      Promise.resolve(
        this.hashCarrier.computeHash(
          {
            file,
            chunkSize
          },
          (error: Error, { progress, hash, time }: HashCallbackData) => {
            if (error) {
              reject(error)
            }
            if (progress === 100) {
              resolve({ progress, hash, time })
            }
            callback && callback({ progress })
          }
        )
      ).then((hash) => {
        abortComputedHash = { abort: hash?.abort, reject }
      })
    })

    return {
      promise,
      abort: () => {
        if (!abortComputedHash) return
        if (abortComputedHash.abort) abortComputedHash.abort()
        abortComputedHash.reject(new Error('Canceled promise to rejected'))
      }
    }
  }
}
