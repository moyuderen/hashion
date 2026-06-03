// @vitest-environment node

import { describe, expect, it } from 'vitest'
import pkg from '../../package.json'

describe('package exports', () => {
  it('should keep optional MD5 implementations on sub-path exports', () => {
    expect(pkg.exports).toHaveProperty('.')
    expect(pkg.exports).toHaveProperty('./sha')
    expect(pkg.exports).toHaveProperty('./spark')
    expect(pkg.exports).toHaveProperty('./sparkWorker')
  })
})
