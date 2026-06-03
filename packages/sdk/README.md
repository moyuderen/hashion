# Hashion

Browser file hashing SDK with MD5, SHA, progress reporting, cancellation, and Web Worker support.

English | [简体中文](./README.zh-CN.md)

## Features

- Calculate file hash in the browser
- Read large files by chunks
- Progress callback support
- Promise-based result
- Cancellable hash calculation
- MD5 with `spark-md5`
- SHA-1 / SHA-256 / SHA-384 / SHA-512 with Web Crypto API
- Web Worker MD5 calculation to keep the main thread responsive
- TypeScript type declarations

## Installation

For SHA algorithms only:

```bash
npm i hashion
```

For `Spark` or `SparkWorker`, install `spark-md5` as well because it is a peer dependency:

```bash
npm i hashion spark-md5
```

## Quick Start

```ts
import { Hashion } from 'hashion'
import { Spark } from 'hashion/spark'

const hasher = new Hashion(Spark)
const chunkSize = 5 * 1024 * 1024

const { promise, abort } = hasher.computedHash(
  {
    file,
    chunkSize
  },
  ({ progress }) => {
    console.log('progress:', progress)
  }
)

try {
  const result = await promise
  console.log('hash:', result.hash)
  console.log('time:', result.time)
} catch (error) {
  console.error(error)
}

// Cancel if needed
// abort()
```

## Import Paths

All exports are available from the main entry:

```ts
import { Hashion, Sha, Spark, SparkWorker } from 'hashion'
import type { HashParameters, HashCallbackData, HashPromiseData } from 'hashion'
```

Or use sub-path imports for tree-shaking:

```ts
import { Hashion } from 'hashion'
import { Sha } from 'hashion/sha'
import { Spark } from 'hashion/spark'
import { SparkWorker } from 'hashion/sparkWorker'
```

## Hash Implementations

### Spark

MD5 calculation on the main thread with `spark-md5`.

```ts
import { Hashion } from 'hashion'
import { Spark } from 'hashion/spark'

const hasher = new Hashion(Spark)
```

### SparkWorker

MD5 calculation in a Web Worker. This is useful for large files because it reduces main-thread blocking.

```ts
import { Hashion } from 'hashion'
import { SparkWorker } from 'hashion/sparkWorker'

const hasher = new Hashion(SparkWorker)
```

### Sha

SHA calculation with the browser Web Crypto API.

```ts
import { Hashion } from 'hashion'
import { Sha } from 'hashion/sha'

const hasher = new Hashion(Sha, {
  algorithm: 'SHA-256'
})
```

Supported algorithms:

```ts
type ShaAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
```

If no algorithm is provided, `SHA-256` is used by default.

## API

### `new Hashion(plugin, options?)`

Creates a hash calculator with one of the supported plugins.

```ts
const hasher = new Hashion(Spark)
const shaHasher = new Hashion(Sha, { algorithm: 'SHA-256' })
```

### `computedHash(parameters, callback)`

Starts hash calculation.

```ts
const { promise, abort } = hasher.computedHash(parameters, callback)
```

#### Parameters

```ts
type HashParameters = {
  file: File
  chunkSize: number
}
```

#### Progress callback

```ts
type HashCallbackData = {
  progress: number
  hash?: string
  time?: number
}

type ProgressCallback = (data: HashCallbackData) => void
```

#### Result

```ts
type HashResult = {
  progress: 100
  hash: string
  time: number
}
```

`promise` resolves when progress reaches `100` and rejects when calculation fails or is cancelled.

#### Cancel calculation

```ts
const { abort } = hasher.computedHash({ file, chunkSize }, onProgress)

abort()
```

## File Input Example

```ts
import { Hashion } from 'hashion'
import { SparkWorker } from 'hashion/sparkWorker'

const hasher = new Hashion(SparkWorker)
const chunkSize = 5 * 1024 * 1024
let cancelHash: (() => void) | undefined

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  input.value = ''

  const { promise, abort } = hasher.computedHash({ file, chunkSize }, ({ progress }) => {
    console.log(`progress: ${progress}%`)
  })

  cancelHash = abort

  const result = await promise
  console.log(result)
}

function handleCancel() {
  cancelHash?.()
}
```

## Choosing an Implementation

| Implementation | Algorithm | Thread | Best for |
| --- | --- | --- | --- |
| `Spark` | MD5 | Main thread | Simple MD5 use cases |
| `SparkWorker` | MD5 | Web Worker | Large files and smoother UI |
| `Sha` | SHA-1 / SHA-256 / SHA-384 / SHA-512 | Main thread + Web Crypto | Standard SHA algorithms |

## Notes

- `Spark` and `SparkWorker` require `spark-md5`.
- `SparkWorker` requires browser Web Worker support.
- `Sha` requires browser Web Crypto API support.
- `Sha` reads files in chunks but computes the final digest from a full in-memory buffer. Files larger than 500 MB are rejected with an error.
- `computedHash` throws if `file` is missing or `chunkSize` is not a positive number.

## Development

```bash
pnpm install
pnpm dev:sdk
pnpm build:sdk
```

Run tests:

```bash
pnpm test:run
```

Build all packages and docs:

```bash
pnpm build:all
```

Preview the package before publishing:

```bash
pnpm publish:dry
```

## License

MIT
