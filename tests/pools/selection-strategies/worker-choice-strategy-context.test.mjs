import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test
} from 'bun:test'
// TODO: switch to bun:test
import { createStubInstance, restore, stub } from 'sinon'
import {
  DynamicThreadPool,
  FairShareWorkerChoiceStrategy,
  FixedThreadPool,
  InterleavedWeightedRoundRobinWorkerChoiceStrategy,
  LeastBusyWorkerChoiceStrategy,
  LeastEluWorkerChoiceStrategy,
  LeastUsedWorkerChoiceStrategy,
  RoundRobinWorkerChoiceStrategy,
  WeightedRoundRobinWorkerChoiceStrategy,
  WorkerChoiceStrategies,
  WorkerChoiceStrategyContext
} from '../../../lib/index.js'

describe('Worker choice strategy context test suite', () => {
  const min = 1
  const max = 3
  let fixedPool, dynamicPool

  beforeAll(() => {
    fixedPool = new FixedThreadPool(
      max,
      './tests/worker-files/thread/testWorker.mjs'
    )
    dynamicPool = new DynamicThreadPool(
      min,
      max,
      './tests/worker-files/thread/testWorker.mjs'
    )
  })

  afterEach(() => {
    restore()
  })

  afterAll(async () => {
    await fixedPool.destroy()
    await dynamicPool.destroy()
  })

  test('Verify that constructor() initializes the context with all the available worker choice strategies', () => {
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    expect(workerChoiceStrategyContext.workerChoiceStrategies.size).toBe(
      Object.keys(WorkerChoiceStrategies).length
    )
  })

  test('Verify that execute() return the worker chosen by the strategy with fixed pool', () => {
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    const WorkerChoiceStrategyStub = createStubInstance(
      RoundRobinWorkerChoiceStrategy,
      {
        choose: stub().returns(0)
      }
    )
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      WorkerChoiceStrategies.ROUND_ROBIN
    )
    workerChoiceStrategyContext.workerChoiceStrategies.set(
      workerChoiceStrategyContext.workerChoiceStrategy,
      WorkerChoiceStrategyStub
    )
    const chosenWorkerKey = workerChoiceStrategyContext.execute()
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategyContext.workerChoiceStrategy
      ).choose.calledOnce
    ).toBe(true)
    expect(chosenWorkerKey).toBe(0)
  })

  test('Verify that execute() throws error if null or undefined is returned after retries', () => {
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    const WorkerChoiceStrategyUndefinedStub = createStubInstance(
      RoundRobinWorkerChoiceStrategy,
      {
        choose: stub().returns(undefined)
      }
    )
    const WorkerChoiceStrategyNullStub = createStubInstance(
      RoundRobinWorkerChoiceStrategy,
      {
        choose: stub().returns(null)
      }
    )
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      WorkerChoiceStrategies.ROUND_ROBIN
    )
    workerChoiceStrategyContext.workerChoiceStrategies.set(
      workerChoiceStrategyContext.workerChoiceStrategy,
      WorkerChoiceStrategyUndefinedStub
    )
    expect(() => workerChoiceStrategyContext.execute()).toThrowError(
      new Error('Worker node key chosen is null or undefined after 6 retries')
    )
    workerChoiceStrategyContext.workerChoiceStrategies.set(
      workerChoiceStrategyContext.workerChoiceStrategy,
      WorkerChoiceStrategyNullStub
    )
    expect(() => workerChoiceStrategyContext.execute()).toThrowError(
      new Error('Worker node key chosen is null or undefined after 6 retries')
    )
  })

  test('Verify that execute() return the worker chosen by the strategy with dynamic pool', () => {
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    const WorkerChoiceStrategyStub = createStubInstance(
      RoundRobinWorkerChoiceStrategy,
      {
        choose: stub().returns(0)
      }
    )
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      WorkerChoiceStrategies.ROUND_ROBIN
    )
    workerChoiceStrategyContext.workerChoiceStrategies.set(
      workerChoiceStrategyContext.workerChoiceStrategy,
      WorkerChoiceStrategyStub
    )
    const chosenWorkerKey = workerChoiceStrategyContext.execute()
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategyContext.workerChoiceStrategy
      ).choose.calledOnce
    ).toBe(true)
    expect(chosenWorkerKey).toBe(0)
  })

  test('Verify that setWorkerChoiceStrategy() works with ROUND_ROBIN and fixed pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.ROUND_ROBIN
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(RoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(RoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with ROUND_ROBIN and dynamic pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.ROUND_ROBIN
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(RoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(RoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with LEAST_USED and fixed pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.LEAST_USED
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(LeastUsedWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with LEAST_USED and dynamic pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.LEAST_USED
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(LeastUsedWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with LEAST_BUSY and fixed pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.LEAST_BUSY
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(LeastBusyWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with LEAST_BUSY and dynamic pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.LEAST_BUSY
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(LeastBusyWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with LEAST_ELU and fixed pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.LEAST_ELU
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(LeastEluWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with LEAST_ELU and dynamic pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.LEAST_ELU
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(LeastEluWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with FAIR_SHARE and fixed pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.FAIR_SHARE
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(FairShareWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with FAIR_SHARE and dynamic pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.FAIR_SHARE
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(FairShareWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with WEIGHTED_ROUND_ROBIN and fixed pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.WEIGHTED_ROUND_ROBIN
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(WeightedRoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with WEIGHTED_ROUND_ROBIN and dynamic pool', () => {
    const workerChoiceStrategy = WorkerChoiceStrategies.WEIGHTED_ROUND_ROBIN
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(WeightedRoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with INTERLEAVED_WEIGHTED_ROUND_ROBIN and fixed pool', () => {
    const workerChoiceStrategy =
      WorkerChoiceStrategies.INTERLEAVED_WEIGHTED_ROUND_ROBIN
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(InterleavedWeightedRoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that setWorkerChoiceStrategy() works with INTERLEAVED_WEIGHTED_ROUND_ROBIN and dynamic pool', () => {
    const workerChoiceStrategy =
      WorkerChoiceStrategies.INTERLEAVED_WEIGHTED_ROUND_ROBIN
    const workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool
    )
    workerChoiceStrategyContext.setWorkerChoiceStrategy(workerChoiceStrategy)
    expect(
      workerChoiceStrategyContext.workerChoiceStrategies.get(
        workerChoiceStrategy
      )
    ).toBeInstanceOf(InterleavedWeightedRoundRobinWorkerChoiceStrategy)
    expect(workerChoiceStrategyContext.workerChoiceStrategy).toBe(
      workerChoiceStrategy
    )
  })

  test('Verify that worker choice strategy options enable median runtime pool statistics', () => {
    const wwrWorkerChoiceStrategy = WorkerChoiceStrategies.WEIGHTED_ROUND_ROBIN
    let workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool,
      wwrWorkerChoiceStrategy,
      {
        runTime: { median: true }
      }
    )
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime
        .average
    ).toBe(false)
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime.median
    ).toBe(true)
    workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool,
      wwrWorkerChoiceStrategy,
      {
        runTime: { median: true }
      }
    )
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime
        .average
    ).toBe(false)
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime.median
    ).toBe(true)
    const fsWorkerChoiceStrategy = WorkerChoiceStrategies.FAIR_SHARE
    workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      fixedPool,
      fsWorkerChoiceStrategy,
      {
        runTime: { median: true }
      }
    )
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime
        .average
    ).toBe(false)
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime.median
    ).toBe(true)
    workerChoiceStrategyContext = new WorkerChoiceStrategyContext(
      dynamicPool,
      fsWorkerChoiceStrategy,
      {
        runTime: { median: true }
      }
    )
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime
        .average
    ).toBe(false)
    expect(
      workerChoiceStrategyContext.getTaskStatisticsRequirements().runTime.median
    ).toBe(true)
  })
})
