# Hashion

浏览器端文件 Hash 计算 SDK，支持 MD5、SHA、进度回调、取消计算和 Web Worker。

[English](./README.md) | 简体中文

## 功能特性

- 在浏览器端计算文件 hash
- 支持大文件分片读取
- 支持进度回调
- 支持 Promise 异步结果
- 支持取消 hash 计算
- 基于 `spark-md5` 计算 MD5
- 基于 Web Crypto API 计算 SHA-1 / SHA-256 / SHA-384 / SHA-512
- 支持在 Web Worker 中计算 MD5，减少主线程阻塞
- 内置 TypeScript 类型声明

## 安装

如果只使用 SHA 算法：

```bash
npm i hashion
```

如果使用 `Spark` 或 `SparkWorker`，还需要安装 `spark-md5`，因为它是 peer dependency：

```bash
npm i hashion spark-md5
```

## 快速开始

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

// 如需取消计算
// abort()
```

## 导入方式

```ts
import { Hashion } from 'hashion'
import { Sha } from 'hashion/sha'
import { Spark } from 'hashion/spark'
import { SparkWorker } from 'hashion/sparkWorker'
```

## Hash 实现

### Spark

在主线程中基于 `spark-md5` 计算 MD5。

```ts
import { Hashion } from 'hashion'
import { Spark } from 'hashion/spark'

const hasher = new Hashion(Spark)
```

### SparkWorker

在 Web Worker 中计算 MD5，适合大文件场景，可以减少主线程阻塞，让页面交互更流畅。

```ts
import { Hashion } from 'hashion'
import { SparkWorker } from 'hashion/sparkWorker'

const hasher = new Hashion(SparkWorker)
```

### Sha

基于浏览器 Web Crypto API 计算 SHA。

```ts
import { Hashion } from 'hashion'
import { Sha } from 'hashion/sha'

const hasher = new Hashion(Sha, {
  algorithm: 'SHA-256'
})
```

支持的算法：

```ts
type ShaAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
```

如果不传 `algorithm`，默认使用 `SHA-256`。

## API

### `new Hashion(plugin, options?)`

使用指定插件创建 hash 计算器。

```ts
const hasher = new Hashion(Spark)
const shaHasher = new Hashion(Sha, { algorithm: 'SHA-256' })
```

### `computedHash(parameters, callback)`

开始计算文件 hash。

```ts
const { promise, abort } = hasher.computedHash(parameters, callback)
```

#### 参数

```ts
type HashParameters = {
  file: File
  chunkSize: number
}
```

#### 进度回调

```ts
type HashCallbackData = {
  progress: number
  hash?: string
  time?: number
}

type ProgressCallback = (data: HashCallbackData) => void
```

#### 计算结果

```ts
type HashResult = {
  progress: 100
  hash: string
  time: number
}
```

`promise` 会在进度达到 `100` 时 resolve，在计算失败或取消计算时 reject。

#### 取消计算

```ts
const { abort } = hasher.computedHash({ file, chunkSize }, onProgress)

abort()
```

## 文件选择示例

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

## 如何选择实现

| 实现 | 算法 | 线程 | 适用场景 |
| --- | --- | --- | --- |
| `Spark` | MD5 | 主线程 | 简单 MD5 计算场景 |
| `SparkWorker` | MD5 | Web Worker | 大文件计算、希望页面更流畅的场景 |
| `Sha` | SHA-1 / SHA-256 / SHA-384 / SHA-512 | 主线程 + Web Crypto | 标准 SHA 算法场景 |

## 注意事项

- `Spark` 和 `SparkWorker` 需要安装 `spark-md5`。
- `SparkWorker` 需要浏览器支持 Web Worker。
- `Sha` 需要浏览器支持 Web Crypto API。
- `Sha` 虽然按分片读取文件，但最终会基于完整内存缓冲区计算 digest。

## 开发

```bash
pnpm install
pnpm dev:sdk
pnpm build:sdk
```

构建 SDK 和文档：

```bash
pnpm build:all
```

发布前预览 npm 包内容：

```bash
pnpm publish:dry
```

## 许可证

MIT
