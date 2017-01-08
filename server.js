require('dotenv').config()
const express = require('express')
const app = express()
const request = require('request')
const moment = require('moment')
const extend = require('lodash/extend')
const queryString = require('query-string')
const cache = require('./cache.js')

app.set('view engine', 'ejs')

// Middleware
app.use('/assets', express.static('public'))
app.use('/favicon.ico', express.static('public/images/favicon.ico'))

const sinceLastOneMonth = moment().subtract(12, 'months')

function getGithubRequestOptions(url, options) {
    const defaultOptions = {
        client_id: process.env.GITHUB_ID,
        client_secret: process.env.GITHUB_SECRET,
    }

    const params = queryString.stringify(extend(defaultOptions, options))

    return {
        url: `https://api.github.com/${url}?${params}`,
        headers: { 'user-agent': process.env.USER_AGENT },
        json: true,
    }
}

app.get('/status/:owner/:repository', (req, res, next) => {
    const repository = `${req.params.owner}/${req.params.repository}`
    const cacheNameRepository = repository.replace('/', '_')

    let json = {
        repository: req.params.owner + '/' + req.params.repository,
        status: true
    }

    cache.get(`${cacheNameRepository}`, (err, data) => {
        if (undefined !== data && sinceLastOneMonth < data.last_commit_date) {
            res.send(json)
            return
        }
    })

    request(
        getGithubRequestOptions(`repos/${repository}/commits`, { since: sinceLastOneMonth })
    , (error, apiResponse, commits) => {
        if (commits.length > 0) {
            cache.set(`${cacheNameRepository}`,
                {
                    last_commit_date: commits[0].commit.committer.date,
                    status : json.status
                }
            )
            res.send(json)
            return
        }

        json.status = false
        res.send(json)
        return
    })
})

app.get('/', (req, res) => {
    request(
        getGithubRequestOptions('repos/KinderGouello/Ressources/contents/README.md')
    , (error, apiResponse, body) => {
        const content = Buffer.from(body.content, body.encoding).toString('utf8')

        const mdRepos = content.match(/\[.+\]\((https|http):\/\/github.com\/.+\)/g)

        const repositoriesList = mdRepos.reduce((object, value) => {
            const href = value.match(/(https|http):\/\/github.com\/.[^\)]+/)[0]

            object.push({
                name: name = href.replace('https://github.com/', '').replace('http://github.com/', ''),
                href: href,
                description: value.match(/\[.+\]/)[0].substr(1).slice(0, -1),
            })

            return object
        }, [])

        res.render('pages/index', { repos: repositoriesList })
    })
})

app.listen(3000)
