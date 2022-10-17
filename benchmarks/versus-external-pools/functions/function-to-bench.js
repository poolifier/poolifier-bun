const fs = require('fs')

const TaskTypes = {
  CPU_INTENSIVE: 'CPU_INTENSIVE',
  IO_INTENSIVE: 'IO_INTENSIVE'
}

module.exports = function (data) {
  console.log('functionToBench', data)
  data = data || {}
  data.taskType = data.taskType || TaskTypes.CPU_INTENSIVE
  data.taskSize = data.taskSize || 5000
  const benchmarksFilePath = '/tmp/poolifier-benchmarks'
  switch (data.taskType) {
    case TaskTypes.CPU_INTENSIVE:
      // CPU intensive task
      for (let i = 0; i < data.taskSize; i++) {
        const o = {
          a: i
        }
        JSON.stringify(o)
      }
      return { ok: 1 }
    case TaskTypes.IO_INTENSIVE:
      // IO intensive task
      for (let i = 0; i < data.taskSize; i++) {
        fs.writeFileSync(benchmarksFilePath, i.toString(), 'utf8')
        fs.readFileSync(benchmarksFilePath, 'utf8')
        fs.unlinkSync(benchmarksFilePath)
      }
      return { ok: 1 }
    default:
      throw new Error(`Unknown task type: ${data.taskType}`)
  }
}
