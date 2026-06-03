# Hashion

Browser file hashing SDK with MD5, SHA, progress reporting, cancellation, and Web Worker support.

English | [简体中文](./README.zh-CN.md)

## Features

- Calculate file hash in the browser
- Read large files by chunks
- Progress callback support
- Promise-based result
- Cancellable hash calculation
- MD5 via `spark-md5` (main thread) or built-in MD5 (Web Worker)
- SHA-1 / SHA-256 / SHA-384 / SHA-512 with Web Crypto API
- Web Worker MD5 calculation (self-contained, no extra dependencies) to keep the main thread responsive
- TypeScript type declarations

## Installation

For SHA algorithms or SparkWorker (no extra dependencies):

```bash
npm i hashion
```

For `Spark` (MD5 on the main thread), you also need `spark-md5`:

```bash
npm i hashion spark-md5
```

## Quick Start

```ts
import { Hashion } from 'hashion'

// No plugin needed — defaults to Sha (SHA-256)
const hasher = new Hashion()
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

The main entry exports `Hashion`, `Sha`, and shared types:

```ts
import { Hashion, Sha } from 'hashion'
import type { HashParameters, HashCallbackData, HashPromiseData } from 'hashion'
```

Optional MD5 implementations are available via sub-path imports:

```ts
import { Hashion } from 'hashion'
import { Spark } from 'hashion/spark'
import { SparkWorker } from 'hashion/sparkWorker'
```

## Hash Implementations

### Spark

MD5 calculation on the main thread with `spark-md5`.

> **Dependency:** Requires `spark-md5`. Install it with `npm i spark-md5`.
> If `spark-md5` is not installed, an error will be reported at runtime.

```ts
import { Hashion } from 'hashion'
import { Spark } from 'hashion/spark'

const hasher = new Hashion(Spark)
```

### SparkWorker

MD5 calculation in a Web Worker. The MD5 algorithm is built-in (inlined), so **no extra dependencies are needed**. This is useful for large files because it reduces main-thread blocking.

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

### `new Hashion(plugin?, options?)`

Creates a hash calculator. If no `plugin` is provided, defaults to `Sha` (SHA-256).

```ts
const hasher = new Hashion()                        // default: Sha (SHA-256)
const shaHasher = new Hashion(Sha, { algorithm: 'SHA-512' })
const md5Hasher = new Hashion(Spark)
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

| Implementation | Algorithm | Thread | Extra Dependency | Best for |
| --- | --- | --- | --- | --- |
| `Spark` | MD5 | Main thread | `spark-md5` | Simple MD5 use cases |
| `SparkWorker` | MD5 | Web Worker | None (built-in) | Large files and smoother UI |
| `Sha` | SHA-1 / SHA-256 / SHA-384 / SHA-512 | Main thread + Web Crypto | None | Standard SHA algorithms |

## Notes

- `Spark` requires `spark-md5` to be installed (`npm i spark-md5`). If not installed, a runtime error with installation instructions will be thrown.
- `SparkWorker` has no extra dependencies — the MD5 algorithm is built-in.
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
