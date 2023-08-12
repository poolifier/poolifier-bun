import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DynamicThreadPool, availableParallelism } from 'poolifier'
import {
  type DataPayload,
  type WorkerData,
  type WorkerResponse
} from './types.js'

const workerFile = join(
  dirname(fileURLToPath(import.meta.url)),
  `worker${extname(fileURLToPath(import.meta.url))}`
)

export const requestHandlerPool = new DynamicThreadPool<
WorkerData<DataPayload>,
WorkerResponse<DataPayload>
>(1, availableParallelism(), workerFile, {
  enableTasksQueue: true,
  tasksQueueOptions: {
    concurrency: 8
  },
  errorHandler: (e: Error) => {
    console.error(e)
  }
})
