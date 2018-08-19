const { consumer: Consumer } = require('webster')
const db = require('./client')
const { logger, channel, redis, sleepTime } = require('./globals')

class RTConsumer extends Consumer {
    constructor (option, connect) {
        super(option)
        this.connect = connect
    }
    async afterCrawlRequest ({ message, referInfo }) {
        const [{ attrValue: raw }] = message
        const { messageId, messageLink } = referInfo
        /* eslint no-control-regex: off */
        const text = raw.replace(/[^\x00-\x7F]/g, '').trim()
        let document = {}

        try {
            document = {
                trade: text.match(/trade.\s*?(#\w+)/im)[1],
                symbol: text.match(/symbol.\s*?(#\w+)/im)[1],
                operation: text.match(/operation.\s*?(#\w+(?:\s+#\w+)?)/im)[1],
                lots: Number(text.match(/lots.\s*?-?(\d+\.\d+)/im)[1]),
                openPrice: Number(text.match(/openprice.\s*?(\d+\.\d+)/im)[1])
            }

            if (/operation.\s*?(#CLOSE)/im.test(text)) {
                Object.assign(document, {
                    closePrice: Number(
                        text.match(/closeprice.\s*?-?(\d+\.\d+)/im)[1]
                    ),
                    profit: Number(text.match(/profit.\s*?-?(\d+\.\d+)/im)[1])
                })
            } else {
                Object.assign(document, {
                    stopLoss: Number(
                        text.match(/stoploss.\s*?-?(\d+\.\d+)/im)[1]
                    ),
                    takeProfit: Number(
                        text.match(/takeprofit.\s*?-?(\d+\.\d+)/im)[1]
                    )
                })
            }

            Object.assign(document, {
                messageId,
                messageLink,
                text
            })
        } catch (error) {
            logger.warn('WARN - Skipped because there is nothing. ')
            logger.trace('%s', JSON.stringify({ message, referInfo }, null, 4))
            return false
        }

        try {
            const { messages } = await db()
            const { insertedCount, insertedId } = await messages.insertOne(
                document
            )
            if (insertedCount) {
                logger.log('OK - Created a new message (%s).', insertedId)
                logger.info('%s', JSON.stringify(document, null, 4))
            }
        } catch (error) {
            logger.error(error)
        }
    }
}

module.exports = new RTConsumer({
    channel,
    sleepTime,
    dbConf: {
        redis
    }
})
