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
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))
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