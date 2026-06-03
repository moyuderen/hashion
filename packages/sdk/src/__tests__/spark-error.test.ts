import { describe, it, expect, vi } from 'vitest'

// Mock spark-md5 to reject before any import of spark.ts happens
vi.mock('spark-md5', () => {
  throw new Error('Module not found: spark-md5')
})

describe('Spark (spark-md5 not installed)', () => {
  it('should show helpful error when spark-md5 fails to load', async () => {
    const { Spark } = await import('../core/spark')
    const spark = new Spark()
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })

    const result = await new Promise<{ error?: Error }>((resolve) => {
      spark.computeHash({ file, chunkSize: 1024 }, (e, _data) => {
        if (e) resolve({ error: e })
      })
    })

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('spark-md5 is required')
    expect(result.error?.message).toContain('npm install spark-md5')
  })
})
