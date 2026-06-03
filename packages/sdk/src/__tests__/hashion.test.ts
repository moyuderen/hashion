import { describe, it, expect, vi } from 'vitest'
import { Hashion } from '../core/hashion'
import type { HashCallbackData } from '../types/hash'

/**
 * Mock plugin for testing Hashion core behavior
 */
class MockPlugin {
  static pluginName = 'hash-plugin'
  static name = 'mock'
  name = 'mock'

  computeHash(
    _data: { file: File; chunkSize: number },
    callback: (e: Error | null, data: HashCallbackData) => void
  ) {
    let aborted = false
    // Simulate async progress and completion
    setTimeout(() => {
      if (aborted) return
      callback(null, { progress: 50 })
    }, 10)
    setTimeout(() => {
      if (aborted) return
      callback(null, { progress: 100, hash: 'abc123', time: 100 })
    }, 20)
    return {
      abort: () => {
        aborted = true
        callback(new Error('Hash calculation cancelled'), { progress: 0 })
      }
    }
  }
}

/**
 * Mock plugin that always errors
 */
class ErrorPlugin {
  static pluginName = 'hash-plugin'
  static name = 'error-plugin'
  name = 'error-plugin'

  computeHash(
    _data: { file: File; chunkSize: number },
    callback: (e: Error | null, data: HashCallbackData) => void
  ) {
    callback(new Error('Plugin error'), { progress: 0 })
    return { abort: () => {} }
  }
}

function createTestFile(content: string, name = 'test.txt'): File {
  return new File([content], name, { type: 'text/plain' })
}

describe('Hashion', () => {
  it('should create instance with a plugin', () => {
    const hasher = new Hashion(MockPlugin)
    expect(hasher.hashionName).toBe('mock')
    expect(hasher.hashCarrier).toBeInstanceOf(MockPlugin)
  })

  it('should resolve with hash result', async () => {
    const hasher = new Hashion(MockPlugin)
    const file = createTestFile('hello')
    const { promise } = hasher.computedHash({ file, chunkSize: 1024 })
    const result = await promise
    expect(result.hash).toBe('abc123')
    expect(result.progress).toBe(100)
    expect(result.time).toBe(100)
  })

  it('should call progress callback', async () => {
    const hasher = new Hashion(MockPlugin)
    const file = createTestFile('hello')
    const onProgress = vi.fn()
    const { promise } = hasher.computedHash({ file, chunkSize: 1024 }, onProgress)
    await promise
    expect(onProgress).toHaveBeenCalled()
    const calls = onProgress.mock.calls.map((call: any[]) => call[0])
    expect(calls.some((c) => c.progress === 50)).toBe(true)
  })

  it('should reject on error from plugin', async () => {
    const hasher = new Hashion(ErrorPlugin)
    const file = createTestFile('hello')
    const { promise } = hasher.computedHash({ file, chunkSize: 1024 })
    await expect(promise).rejects.toThrow('Plugin error')
  })

  it('should reject on abort', async () => {
    const hasher = new Hashion(MockPlugin)
    const file = createTestFile('hello')
    const { promise, abort } = hasher.computedHash({ file, chunkSize: 1024 })
    // Abort after a short delay to let abortComputedHash be set
    setTimeout(() => abort(), 5)
    await expect(promise).rejects.toThrow('Hash calculation cancelled')
  })

  it('should throw if file is missing', () => {
    const hasher = new Hashion(MockPlugin)
    expect(() => hasher.computedHash({ file: null as any, chunkSize: 1024 })).toThrow(
      'file is required'
    )
  })

  it('should throw if chunkSize is invalid', () => {
    const hasher = new Hashion(MockPlugin)
    const file = createTestFile('hello')
    expect(() => hasher.computedHash({ file, chunkSize: 0 })).toThrow(
      'chunkSize must be a positive number'
    )
    expect(() => hasher.computedHash({ file, chunkSize: -1 })).toThrow(
      'chunkSize must be a positive number'
    )
  })

  it('should not double-resolve promise when error occurs before progress=100', async () => {
    // Plugin that first errors then tries to send progress=100
    class DoubleCallPlugin {
      static pluginName = 'hash-plugin'
      static name = 'double'
      name = 'double'

      computeHash(
        _data: { file: File; chunkSize: number },
        callback: (e: Error | null, data: HashCallbackData) => void
      ) {
        callback(new Error('first error'), { progress: 0 })
        // This should be ignored because of the fix
        callback(null, { progress: 100, hash: 'should not reach', time: 0 })
        return { abort: () => {} }
      }
    }

    const hasher = new Hashion(DoubleCallPlugin)
    const file = createTestFile('hello')
    const { promise } = hasher.computedHash({ file, chunkSize: 1024 })
    await expect(promise).rejects.toThrow('first error')
  })
})
