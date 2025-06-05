import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: '/example/index.html'
  },
  plugins: [
    dts({
      insertTypesEntry: true, // 自动在 package.json 中添加 types 字段
      tsconfigPath: './tsconfig.json',
      outDir: 'dist', // 声明文件输出目录
      strictOutput: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        sha: path.resolve(__dirname, 'src/core/sha.ts'),
        spark: path.resolve(__dirname, 'src/core/spark.ts'),
        sparkWorker: path.resolve(__dirname, 'src/core/sparkWorker.ts')
      },
      name: 'Hashison',
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ['es']
    },
    rollupOptions: {
      // 外部化依赖（可选）
      external: ['spark-md5'],
      output: {
        preserveModules: true,
        exports: 'named', // 保留默认行为
        globals: {
          'spark-md5': 'SparkMD5'
        }
      }
    }
  }
})
