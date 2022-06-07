const crypto = require('crypto');
const fetch = require('http')
const express = require('express')
const bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json());
app.use(express.static('public'))

var ts = Math.floor(Date.now() / 1000).toString()

function generateHash(ts, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    return hmac.update(ts).digest('base64');
}

function generateFetch(req, res, action) {
    const input = "identifier=" + req.body.id + "&hash=" + generateHash(ts, req.body.code) + "=&ts=" + ts
    const options = {
	    hostname: req.body.ip.split(":")[0],
	    port: req.body.ip.split(":")[1],
	    path: "/" + action,
	    method: "POST",
	    headers: {
    		'Content-Type': 'application/json',
    		'Content-Length': input.length,
  	    }
    }
    const http = fetch.request(options, (response) => {
	let data = ""

        response.on('data', (chunk) => {
		data += chunk;
	});

	response.on('end', () => {
        	res.status(201).json(JSON.parse(data))
    	});
    }).on("error", (err) => {
    	res.status(500).json({ error: err })
    });

    http.write(input)
    http.end()
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


app.listen(port, () => {
})
