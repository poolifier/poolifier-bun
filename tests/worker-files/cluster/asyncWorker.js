'use strict'
const { ClusterWorker, KillBehaviors } = require('../../../lib')
const TestUtils = require('../../test-utils')

async function sleep (data) {
  return TestUtils.sleepWorkerFunction(data, 2000)
}

module.exports = new ClusterWorker(sleep, {
  maxInactiveTime: 500,
  async: true,
  killBehavior: KillBehaviors.HARD
})
