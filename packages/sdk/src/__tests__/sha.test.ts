import { describe, it, expect, vi } from 'vitest'
import { Sha } from '../core/sha'
import type { HashCallbackData } from '../types/hash'

function createTestFile(content: string, name = 'test.txt'): File {
  return new File([content], name, { type: 'text/plain' })
}

function waitForHash(
  sha: Sha,
  file: File,
  chunkSize: number
): Promise<{ result?: HashCallbackData; error?: Error; progressValues: number[] }> {
  return new Promise((resolve) => {
    const progressValues: number[] = []
    let result: HashCallbackData | undefined
    let error: Error | undefined

    sha.computeHash({ file, chunkSize }, (e, data) => {
      if (e) {
        error = e
        resolve({ error, progressValues })
        return
      }
      progressValues.push(data.progress)
      if (data.progress === 100) {
        result = data
        resolve({ result, progressValues })
      }
    })
  })
}

describe('Sha', () => {
  it('should have correct static properties', () => {
    expect(Sha.pluginName).toBe('hash-plugin')
    expect(Sha.name).toBe('SHA')
  })

  it('should default to SHA-256', () => {
    const sha = new Sha()
    expect(sha.algorithm).toBe('SHA-256')
    expect(sha.name).toBe('SHA')
  })

  it('should accept custom algorithm', () => {
    const sha = new Sha({ algorithm: 'SHA-1' })
    expect(sha.algorithm).toBe('SHA-1')
  })

  it('should compute SHA-256 correctly for known content', async () => {
    const sha = new Sha({ algorithm: 'SHA-256' })
    const file = createTestFile('hello world')
    const { result, error } = await waitForHash(sha, file, 1024 * 1024)
    expect(error).toBeUndefined()
    expect(result?.hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9')
    expect(result?.progress).toBe(100)
    expect(typeof result?.time).toBe('number')
  })

  it('should compute SHA-1 correctly', async () => {
    const sha = new Sha({ algorithm: 'SHA-1' })
    const file = createTestFile('hello world')
    const { result, error } = await waitForHash(sha, file, 1024 * 1024)
    expect(error).toBeUndefined()
    expect(result?.hash).toBe('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed')
  })

  it('should compute SHA-384 correctly', async () => {
    const sha = new Sha({ algorithm: 'SHA-384' })
    const file = createTestFile('hello world')
    const { result, error } = await waitForHash(sha, file, 1024 * 1024)
    expect(error).toBeUndefined()
    // SHA-384 produces 96 hex chars
    expect(result?.hash).toHaveLength(96)
  })

  it('should compute SHA-512 correctly', async () => {
    const sha = new Sha({ algorithm: 'SHA-512' })
    const file = createTestFile('hello world')
    const { result, error } = await waitForHash(sha, file, 1024 * 1024)
    expect(error).toBeUndefined()
    // SHA-512 produces 128 hex chars
    expect(result?.hash).toHaveLength(128)
  })

  it('should report progress for multi-chunk files', async () => {
    const sha = new Sha({ algorithm: 'SHA-256' })
    // Create a file larger than chunkSize
    const content = 'a'.repeat(100)
    const file = createTestFile(content)
    const { result, progressValues } = await waitForHash(sha, file, 40)
    expect(result?.hash).toBeTruthy()
    // Should have progress updates (at least one intermediate)
    expect(progressValues.length).toBeGreaterThan(1)
    expect(progressValues[progressValues.length - 1]).toBe(100)
  })

  it('should handle empty file', async () => {
    const sha = new Sha({ algorithm: 'SHA-256' })
    const file = createTestFile('')
    const { result, error } = await waitForHash(sha, file, 1024)
    expect(error).toBeUndefined()
    // SHA-256 of empty string
    expect(result?.hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })

  it('should support abort', async () => {
    const sha = new Sha({ algorithm: 'SHA-256' })
    const content = 'x'.repeat(10_000)
    const file = createTestFile(content)

    const errorCallback = vi.fn()
    sha.computeHash({ file, chunkSize: 100 }, (e, _data) => {
      if (e) errorCallback(e)
    }).abort()

    // Abort should trigger error callback
    expect(errorCallback).toHaveBeenCalledWith(expect.any(Error))
  })

  it('should return abort function', () => {
    const sha = new Sha()
    const file = createTestFile('test')
    const result = sha.computeHash({ file, chunkSize: 1024 }, () => {})
    expect(typeof result.abort).toBe('function')
  })
})
