const { producer: Producer, task: Task } = require('webster')
const {
    channel,
    redis,
    logger,
    channelURL,
    channelMessageId,
    maxTasksPerProducer
} = require('./globals')
const url = require('url')
const mongoc = require('./client')
const producer = new Producer({
    channel,
    dbConf: {
        redis
    }
})

module.exports = async function () {
    let tailMessageId

    try {
        const client = await mongoc
        const db = client.db()
        const messages = db.collection('messages')

        const query = {}
        const options = {
            sort: { messageId: -1 },
            projection: { messageId: 1 }
        }
        const { messageId } = await messages.findOne(query, options)

        tailMessageId = messageId
    } catch (error) {
        // Cuando la coleccion no existe, o no encuentre ultimo messageId, next.id sera el valor "semilla"
        tailMessageId = channelMessageId
        logger.warn(
            `-- UNDEFINED COLLECTION -- Starting to seed from ${tailMessageId}`
        )
    }

    for (let i = 1; i <= maxTasksPerProducer; i++) {
        const messageId = tailMessageId + i
        const messageLink = url.format(
            url.parse(
                (channelURL.split(-1) === '/' ? channelURL : channelURL + '/') +
                    messageId
            )
        )

        const task = new Task({
            spiderType: 'plain',
            url: messageLink,
            targets: [
                {
                    selector: 'meta[name="twitter:description"]',
                    type: 'attr',
                    attrName: 'content',
                    field: 'message'
                }
            ],
            referInfo: {
                messageId,
                messageLink
            }
        })

        producer.generateTask(task).then(
            () => {
                logger.log('OK - Created a new task (%s)', task.id)
                logger.info('%s', JSON.stringify(task, null, 4))
            },
            error => {
                logger.error('%s', error)
            }
        )
    }
}
