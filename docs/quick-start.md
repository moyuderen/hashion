---
outline: deep
---

# Quick start

## Install

```bash
npm i hashion
```

## Useage

### import Hashion (Base class)

```ts
import { Hashion } from 'hashion'
```

### Sha

```ts
import { Sha } from 'hashion/sha'

type ShaAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

const hasher = new Hashion(Sha, options: {
  algorithm: 'SHA-256'
})
```

> [!NOTE]
> 不传参数`options`, 默认使用`SHA-256`算法

### Spark

```ts
import { Spark } from 'hashion/spark'

const hasher = new Hashion(Spark)
```

### SparkWorker

```ts
import { SparkWorker } from 'hashion/sparkWorker'

const hasher = new Hashion(SparkWorker)
```

### How to Use

```ts
type HashParameters = {
  /** File */
  file: File
  /** 分开大小 */
  chunkSize: number
}

type HashCallbackData = {
  /** 计算进度 1-100 */
  progress: number
  /** 成功之后的hash值 */
  hash?: string
  /** 计算耗时，单位为ms */
  time?: number
}

type HashCallback = (e: any, data: HashCallbackData) => void

let readCancel
const chunkSize = 5 * 1024 * 1024
const hasher = new Hashion(Spark)

const callback = ({ progress }) => {
  console.log('progress', progress)
}

const handleSelected = async (e) => {
  const file = e.target.files[0]
  e.target.value = ''

  const { promise, abort } = hasher.computedHash({ file, chunkSize }, callback)
  readCancel = abort
  const result: HashCallbackData = await promise
}

const handleAbort = () => readCancel && readCancel()
```
