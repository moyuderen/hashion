import { Hashion } from '../src'
import { Sha } from '../src/core/sha'
import { Spark } from '../src/core/spark'
import { SparkWorker } from '../src/core/sparkWorker'

const app = Vue.createApp({
  setup() {
    const chunkSize = 5 * 1024 * 1024
    const hasher = new Hashion(Spark)
    // const hasher = new Hashion(Sha)
    // const hasher = new Hashion(SparkWorker)

    let readCancel

    const handleSelected = async (e) => {
      const file = e.target.files[0]
      e.target.value = ''

      const callback = ({ progress }) => {
        console.log('progress', progress)
      }
      const { promise, abort } = hasher.computedHash({ file, chunkSize }, callback)
      readCancel = abort

      const result = await promise
      console.log(result)
    }

    const handleAbort = () => readCancel && readCancel()

    return {
      handleSelected,
      handleAbort
    }
  }
})

app.use(ElementPlus)
app.mount('#app')
