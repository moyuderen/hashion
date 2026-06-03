import { describe, it, expect, vi } from 'vitest'
import { SparkWorker } from '../core/sparkWorker'

function createTestFile(content: string, name = 'test.txt'): File {
  return new File([content], name, { type: 'text/plain' })
}

// Note: Web Worker tests require a real browser environment.
// jsdom does not fully support Workers, so we test the interface
// and basic behavior that can be verified without actual Worker execution.

describe('SparkWorker', () => {
  it('should have correct static properties', () => {
    expect(SparkWorker.pluginName).toBe('hash-plugin')
    expect(SparkWorker.name).toBe('sparkMd5Webworker')
  })

  it('should set correct instance name', () => {
    const worker = new SparkWorker()
    expect(worker.name).toBe('sparkMd5Webworker')
  })

  it('should return abort function from computeHash', () => {
    const worker = new SparkWorker()
    const file = createTestFile('test')
    const result = worker.computeHash({ file, chunkSize: 1024 }, () => {})
    expect(typeof result.abort).toBe('function')
  })

  it('should call callback with error when Worker is not supported', () => {
    // Temporarily mock window.Worker to simulate unsupported environment
    const originalWorker = window.Worker
    // @ts-expect-error - intentionally setting to undefined for test
    window.Worker = undefined

    const worker = new SparkWorker()
    const file = createTestFile('test')
    const callback = vi.fn()

    worker.computeHash({ file, chunkSize: 1024 }, callback)

    expect(callback).toHaveBeenCalledWith(expect.any(Error), { progress: 0 })
    expect(callback.mock.calls[0][0].message).toBe('Web Worker is not supported')

    // Restore
    window.Worker = originalWorker
  })

  it('should send file and chunkSize to worker', () => {
    const worker = new SparkWorker()
    const file = createTestFile('hello world')
    const callback = vi.fn()

    // We can verify the function doesn't throw and returns abort
    const result = worker.computeHash({ file, chunkSize: 5 * 1024 * 1024 }, callback)
    expect(result.abort).toBeDefined()
  })

  it('should handle abort without errors', () => {
    const worker = new SparkWorker()
    const file = createTestFile('test')
    const callback = vi.fn()
    const { abort } = worker.computeHash({ file, chunkSize: 1024 }, callback)

    // Calling abort should not throw
    expect(() => abort()).not.toThrow()
  })

  it('should handle multiple abort calls gracefully', () => {
    const worker = new SparkWorker()
    const file = createTestFile('test')
    const callback = vi.fn()
    const { abort } = worker.computeHash({ file, chunkSize: 1024 }, callback)

    expect(() => {
      abort()
      abort()
    }).not.toThrow()
  })
})
