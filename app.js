// importing express
import express from 'express'
import { Generator } from './generate.js'
import path from "path"
import bodyParser from 'body-parser'
import cors from "cors"

// creating a instance of express
const app = express();
var whitelist = [
	'http://localhost:3000', 
	'http://localhost:1313', 
	'http://localhost:8888', 
	'http://techlockdown.com',
	'https://pmo-dev.netlify.app',
	'https://pmo-stage.netlify.app'
]
var whitelist = ['http://example1.com', 'http://example2.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}
app.use(cors(corsOptionsDelegate))
app.listen(process.env.PORT || 3000, console.log('App Running'))

const BASE_DIR = path.resolve();
app.get('/', async(req, res) => {
	res.sendFile(path.resolve(path.resolve() +'/index.html'))
})

app.use(bodyParser.json())

// Return host file entries based on skipped items
app.post('/api/hosts', async(req, res) => {
		console.log("reqw", req.body)
		const generator = new Generator(req.body);
		let blocklist = await generator.getBlocklist();
		//console.log(blocklist)
		//let payload = blocklist.text();
    res.send(blocklist)
})

app.get('/api/hosts', async(req, res) => {
		const generator = new Generator();
		let options = await generator.getCacheMap();
		//console.log(blocklist)
		//let payload = blocklist.text();
    res.send(options)
})