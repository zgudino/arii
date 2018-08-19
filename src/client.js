const MongoClient = require('mongodb').MongoClient
const { mongodbURI } = require('./globals')

module.exports = async function () {
    const client = await MongoClient.connect(mongodbURI)
    const db = await client.db()

    db.collection('messages').createIndex('messageId', { unique: true })

    return {
        messages: db.collection('messages')
    }
}
