const MongoClient = require('mongodb').MongoClient
const { mongodbURI } = require('./globals')

module.exports = (async function (params) {
    const client = MongoClient.connect(mongodbURI)

    // TODO: Donde colocar definicion de esquema para las colleciones?
    return client
})()
