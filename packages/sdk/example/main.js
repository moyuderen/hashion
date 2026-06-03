import { Hashion } from '../src'
import { SparkWorker } from '../src/core/sparkWorker'

const { createApp, ref } = Vue

const app = createApp({
  setup() {
    const chunkSize = 5 * 1024 * 1024
    const hasher = new Hashion(SparkWorker)

    const fileInput = ref(null)
    const computing = ref(false)
    const progress = ref(0)
    const hashValue = ref('')
    const hashTime = ref(0)
    const fileName = ref('')
    const error = ref(null)

    let abortFn = null

    function triggerFile() {
      fileInput.value.click()
    }

    async function handleSelected(e) {
      const file = e.target.files[0]
      e.target.value = ''

      if (!file) return

      fileName.value = file.name
      computing.value = true
      progress.value = 0
      hashValue.value = ''
      hashTime.value = 0
      error.value = null

      const { promise, abort } = hasher.computedHash(
        { file, chunkSize },
        ({ progress: p }) => {
          progress.value = Math.round(p * 100) / 100
        }
      )

      abortFn = abort

      try {
        const data = await promise
        hashValue.value = data.hash
        hashTime.value = data.time
      } catch (err) {
        error.value = err.message || 'Hash computation was cancelled or failed.'
      } finally {
        computing.value = false
        abortFn = null
      }
    }

    function handleAbort() {
      abortFn?.()
    }

    return {
      fileInput,
      computing,
      progress,
      hashValue,
      hashTime,
      fileName,
      error,
      triggerFile,
      handleSelected,
      handleAbort
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
