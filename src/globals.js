const redis = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
}

// TODO: A potential bug.
if (process.env.REDIS_PASSWORD || process.env.REDIS_PASSWORD === '') {
    Object.assign(redis, {
        password: process.env.REDIS_PASSWORD
    })
}

// TODO: Could be refactored.
const logger = require('tracer').colorConsole()

module.exports = {
    channel: process.env.CHANNEL || '',
    channelURL: process.env.TELEGRAM_CHANNEL_URL || '',
    channelMessageId: Number(process.env.TELEGRAM_CHANNEL_MESSAGEID) || 0,
    mongodbURI: process.env.MONGO_URI || '',
    redis,
    logger,
    maxTasksPerProducer: Number(process.env.THRESHOLD) || 5,
    sleepTime: Number(process.env.SLEEP_TIME) || 5e3,
    schedule: process.env.SCHEDULE || '* * * * *'
}
