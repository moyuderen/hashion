import { describe, it, expect } from 'vitest'
import { Spark } from '../core/spark'
import type { HashCallbackData } from '../types/hash'

function createTestFile(content: string, name = 'test.txt'): File {
  return new File([content], name, { type: 'text/plain' })
}

function waitForHash(
  spark: Spark,
  file: File,
  chunkSize: number
): Promise<{ result?: HashCallbackData; error?: Error; progressValues: number[] }> {
  return new Promise((resolve) => {
    const progressValues: number[] = []
    let result: HashCallbackData | undefined
    let error: Error | undefined

    spark.computeHash({ file, chunkSize }, (e, data) => {
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

describe('Spark', () => {
  it('should have correct static properties', () => {
    expect(Spark.pluginName).toBe('hash-plugin')
    expect(Spark.name).toBe('spark-md5')
  })

  it('should set instance name from static property', () => {
    const spark = new Spark()
    expect(spark.name).toBe(Spark.name)
  })

  it('should compute MD5 correctly for known content', async () => {
    const spark = new Spark()
    const file = createTestFile('hello world')
    const { result, error } = await waitForHash(spark, file, 1024 * 1024)
    expect(error).toBeUndefined()
    // Known MD5 of "hello world"
    expect(result?.hash).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3')
    expect(result?.progress).toBe(100)
    expect(typeof result?.time).toBe('number')
  })

  it('should compute MD5 for empty file', async () => {
    const spark = new Spark()
    const file = createTestFile('')
    const { result, error } = await waitForHash(spark, file, 1024)
    expect(error).toBeUndefined()
    // MD5 of empty string
    expect(result?.hash).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('should report progress for multi-chunk files', async () => {
    const spark = new Spark()
    const content = 'a'.repeat(100)
    const file = createTestFile(content)
    const { result, progressValues } = await waitForHash(spark, file, 40)
    expect(result?.hash).toBeTruthy()
    expect(progressValues.length).toBeGreaterThan(1)
    expect(progressValues[progressValues.length - 1]).toBe(100)
  })

  it('should return abort function', () => {
    const spark = new Spark()
    const file = createTestFile('test')
    const result = spark.computeHash({ file, chunkSize: 1024 }, () => {})
    expect(typeof result.abort).toBe('function')
  })

  it('should handle abort', async () => {
    const spark = new Spark()
    const content = 'x'.repeat(10_000)
    const file = createTestFile(content)

    const errorPromise = new Promise<Error>((resolve) => {
      spark.computeHash({ file, chunkSize: 100 }, (e, _data) => {
        if (e) resolve(e)
      }).abort()
    })

    const error = await errorPromise
    expect(error).toBeInstanceOf(Error)
  })

  it('should compute MD5 for binary content', async () => {
    const spark = new Spark()
    const buffer = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    const file = new File([buffer], 'binary.dat', { type: 'application/octet-stream' })
    const { result, error } = await waitForHash(spark, file, 1024)
    expect(error).toBeUndefined()
    expect(result?.hash).toBeTruthy()
    expect(result?.hash).toHaveLength(32) // MD5 is 32 hex chars
  })
})
