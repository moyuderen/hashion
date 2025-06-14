import { sparkMD5Code } from './sparkMd5Code'

export const workerCode = `self.onmessage = (e) => {
  ${sparkMD5Code()}

  const { file, chunkSize, type } = e.data
  const fileReader = new FileReader()
  let ended = false

  if(type === 'CANCELED') {
    if(ended) return
    fileReader.abort()
    self.postMessage({ error: new Error('Hash calculation cancelled !'), progress: 0 })
  }

  if(type === 'DONE') {
    console.log('Hash calculation closed !')
    self.close()
    return
  }

  const slice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  const spark = new SparkMD5.ArrayBuffer()
  const totalChunks = Math.ceil(file.size / chunkSize)
  const startTime = Date.now()
  let currentChunk = 0

  fileReader.onload = (e) => {
    if(type === 'CANCELED') return

    spark.append(e.target.result)
    currentChunk++

    if (currentChunk < totalChunks) {
      loadNext()
      self.postMessage({ error: null, progress: (currentChunk / totalChunks) * 100 })
    } else {
      ended = true
      const result = {
        hash: spark.end(),
        time: Date.now() - startTime,
        progress: 100
      }
      self.postMessage({ error: null, ...result })
    }
  }

  fileReader.onerror = (error) => {
    if(type === 'CANCELED') return
    console.warn('oops, something went wrong.')
    self.postMessage({ error, progress: 0 })
  }

  function loadNext() {
    if(type === 'CANCELED') return
    const start = currentChunk * chunkSize
    const end = start + chunkSize >= file.size ? file.size : start + chunkSize

    fileReader.readAsArrayBuffer(slice.call(file, start, end))
  }

  loadNext()
}
`
