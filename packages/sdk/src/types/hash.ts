export type HashParameters = {
  file: File
  chunkSize: number
}

export type HashCallbackData = {
  progress: number
  hash?: string
  time?: number
}

export type HashCallback = (e: Error | null, data: HashCallbackData) => void

export type HashPromiseData = Required<HashCallbackData>

export interface HashPluginInstance {
  name: string
  computeHash(data: HashParameters, callback: HashCallback): { abort: () => void }
}

export interface HashPluginConstructor {
  pluginName: string
  name: string
  new (options?: Record<string, unknown>): HashPluginInstance
}
