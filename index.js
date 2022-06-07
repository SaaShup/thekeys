const crypto = require('crypto');
const fetch = require('node-fetch')
const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());
app.use(express.static('public'))

var ts = Math.floor(Date.now() / 1000).toString()

function generateHash(ts, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    return hmac.update(ts).digest('base64');
}

function generateFetch(req, res, action) {
    fetch("http://" + req.body.ip + "/" + action, {
        method: 'POST',
        body: "identifier=" + req.body.id + "&hash=" + generateHash(ts, req.body.code) + "=&ts=" + ts
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      res.status(201).json(json)
    })
    .catch(function (error) {
      res.status(500).json({ error: error })
    })
}

app.post('*', (req, res, next) => {
    ts = Math.floor(Date.now() / 1000).toString()
    next()
})

app.post('/locker_status', (req, res) => {
  if (req.body.ip && req.body.id && req.body.code) {
    generateFetch(req, res, 'locker_status')
  } else res.status(404).json({ error: 'action not found' })
})

app.post('/open', (req, res) => {
  if (req.body.ip && req.body.id && req.body.code) {
    generateFetch(req, res, 'open')
  } else res.status(404).json({ error: 'action not found' })
})


app.post('/close', (req, res) => {
  if (req.body.ip && req.body.id && req.body.code) {
    generateFetch(req, res, 'close')
  } else res.status(404).json({ error: 'action not found' })
})


app.listen("8080", () => {
})
