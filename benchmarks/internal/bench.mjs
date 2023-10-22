import {
  PoolTypes,
  WorkerTypes,
  availableParallelism
} from '../../lib/index.js'
import { TaskFunctions } from '../benchmarks-types.js'
import {
  buildPoolifierPool,
  runPoolifierPoolBenchmark
} from '../benchmarks-utils.js'

const poolSize = availableParallelism()
const taskExecutions = 1
const workerData = {
  function: TaskFunctions.jsonIntegerSerialization,
  taskSize: 1000
}

// FixedThreadPool
await runPoolifierPoolBenchmark(
  'FixedThreadPool',
  buildPoolifierPool(WorkerTypes.thread, PoolTypes.fixed, poolSize),
  {
    taskExecutions,
    workerData
  }
)

// DynamicThreadPool
await runPoolifierPoolBenchmark(
  'DynamicThreadPool',
  buildPoolifierPool(WorkerTypes.thread, PoolTypes.dynamic, poolSize),
  {
    taskExecutions,
    workerData
  }
)

// FixedClusterPool
await runPoolifierPoolBenchmark(
  'FixedClusterPool',
  buildPoolifierPool(WorkerTypes.cluster, PoolTypes.fixed, poolSize),
  {
    taskExecutions,
    workerData
  }
)

// DynamicClusterPool
await runPoolifierPoolBenchmark(
  'DynamicClusterPool',
  buildPoolifierPool(WorkerTypes.cluster, PoolTypes.dynamic, poolSize),
  {
    taskExecutions,
    workerData
  }
)
