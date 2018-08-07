const dotenv = require('dotenv')

dotenv.config()

const cron = require('node-cron')
const { schedule } = require('./globals')
const producer = require('./producer')
const consumer = require('./consumer')

cron.schedule(schedule, producer)
consumer.startConsume()
