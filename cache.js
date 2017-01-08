require('dotenv').config()
const fs = require('fs')
const mkdirp = require('mkdirp')

const cache = {
    get: (key, callback) => {
        try {
            callback(undefined, fs.readFileSync('./' + process.env.CACHE_DIR + `/${key}.json`, 'utf8', (err, data) => {
                return JSON.parse(data)
            }))
        } catch (e) {
            callback(e, undefined)
        }
    },
    set: (key, value, callback) => {
        mkdirp('./' + process.env.CACHE_DIR, (err) => {
            fs.writeFile('./' + process.env.CACHE_DIR + `/${key}.json`, JSON.stringify(value))
        })
    }
}

module.exports = cache
