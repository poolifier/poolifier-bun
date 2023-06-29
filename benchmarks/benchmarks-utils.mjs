import crypto from 'crypto'
import fs from 'fs'
import {
  DynamicClusterPool,
  DynamicThreadPool,
  FixedClusterPool,
  FixedThreadPool
} from '../lib/index.mjs'
import { PoolTypes, WorkerFunctions, WorkerTypes } from './benchmarks-types.mjs'

export async function runTest (pool, { taskExecutions, workerData }) {
  return new Promise((resolve, reject) => {
    let executions = 0
    for (let i = 1; i <= taskExecutions; i++) {
      pool
        .execute(workerData)
        .then(() => {
          ++executions
          if (executions === taskExecutions) {
            return resolve({ ok: 1 })
          }
          return null
        })
        .catch(err => {
          console.error(err)
          return reject(err)
        })
    }
  })
}

export function generateRandomInteger (max = Number.MAX_SAFE_INTEGER, min = 0) {
  if (max < min || max < 0 || min < 0) {
    throw new RangeError('Invalid interval')
  }
  max = Math.floor(max)
  if (min != null && min !== 0) {
    min = Math.ceil(min)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  return Math.floor(Math.random() * (max + 1))
}

function jsonIntegerSerialization (n) {
  for (let i = 0; i < n; i++) {
    const o = {
      a: i
    }
    JSON.stringify(o)
  }
}

/**
 * Intentionally inefficient implementation.
 * @param {number} n - The number of fibonacci numbers to generate.
 * @returns {number} - The nth fibonacci number.
 */
function fibonacci (n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

/**
 * Intentionally inefficient implementation.
 * @param {number} n - The number to calculate the factorial of.
 * @returns {number} - The factorial of n.
 */
function factorial (n) {
  if (n === 0) {
    return 1
  }
  return factorial(n - 1) * n
}

function readWriteFiles (
  n,
  baseDirectory = `/tmp/poolifier-benchmarks/${crypto.randomInt(
    281474976710655
  )}`
) {
  if (fs.existsSync(baseDirectory) === true) {
    fs.rmSync(baseDirectory, { recursive: true })
  }
  fs.mkdirSync(baseDirectory, { recursive: true })
  for (let i = 0; i < n; i++) {
    const filePath = `${baseDirectory}/${i}`
    fs.writeFileSync(filePath, i.toString(), {
      encoding: 'utf8',
      flag: 'a'
    })
    fs.readFileSync(filePath, 'utf8')
  }
  fs.rmSync(baseDirectory, { recursive: true })
}

export function executeWorkerFunction (data) {
  switch (data.function) {
    case WorkerFunctions.jsonIntegerSerialization:
      return jsonIntegerSerialization(data.taskSize || 1000)
    case WorkerFunctions.fibonacci:
      return fibonacci(data.taskSize || 1000)
    case WorkerFunctions.factorial:
      return factorial(data.taskSize || 1000)
    case WorkerFunctions.readWriteFiles:
      return readWriteFiles(data.taskSize || 1000)
    default:
      throw new Error('Unknown worker function')
  }
}

export function buildPool (workerType, poolType, poolSize, poolOptions) {
  switch (poolType) {
    case PoolTypes.fixed:
      switch (workerType) {
        case WorkerTypes.thread:
          return new FixedThreadPool(
            poolSize,
            './benchmarks/internal/thread-worker.mjs',
            poolOptions
          )
        case WorkerTypes.cluster:
          return new FixedClusterPool(
            poolSize,
            './benchmarks/internal/cluster-worker.mjs',
            poolOptions
          )
      }
      break
    case PoolTypes.dynamic:
      switch (workerType) {
        case WorkerTypes.thread:
          return new DynamicThreadPool(
            poolSize / 2,
            poolSize * 3,
            './benchmarks/internal/thread-worker.mjs',
            poolOptions
          )
        case WorkerTypes.cluster:
          return new DynamicClusterPool(
            poolSize / 2,
            poolSize * 3,
            './benchmarks/internal/cluster-worker.mjs',
            poolOptions
          )
      }
      break
  }
}