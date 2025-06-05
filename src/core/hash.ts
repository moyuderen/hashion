import type { HashParameters, HashCallbackData } from '../types/hash'

export class Hash {
  hashCarrier: any

  constructor(plugin: any, options?: Record<string, any>) {
    this.hashCarrier = new plugin(options)
  }

  computedHash({ file, chunkSize }: HashParameters, callback: (data: HashCallbackData) => void) {
    let abortComputedHash: any

    const promise = new Promise(async (resolve, reject) => {
      const { abort } = await Promise.resolve(
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
      )
      abortComputedHash = { abort, reject }
    })

    return {
      promise,
      abort: () => {
        if (!abortComputedHash) return
        abortComputedHash.abort()
        abortComputedHash.reject(new Error('Canceled promise to rejected'))
      }
    }
  }
}
