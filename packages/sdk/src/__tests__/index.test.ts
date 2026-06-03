// @vitest-environment node

import { describe, expect, it } from 'vitest'

describe('root entry', () => {
  it('should be importable in non-browser environments', async () => {
    const mod = await import('../index')

    expect(mod.Hashion).toBeDefined()
    expect(mod.Sha).toBeDefined()
    expect('Spark' in mod).toBe(false)
    expect('SparkWorker' in mod).toBe(false)
  })
})
