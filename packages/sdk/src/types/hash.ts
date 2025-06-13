export type HashParameters = {
  file: File
  chunkSize: number
}

export type HashCallbackData = {
  progress: number
  hash?: string
  time?: number
}

export type HashCallback = (e: any, data: HashCallbackData) => void

export type HashPromiseData = Required<HashCallbackData>

