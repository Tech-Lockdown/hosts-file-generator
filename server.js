import express from 'express'
// import { Generator } from './generate.js'
import { Generator } from './generator.js'
import path from "path"
import bodyParser from 'body-parser'
import cors from "cors"
import fs from "fs"

export const app = express();

var whitelist = [
	'http://localhost:3000', 
	'http://localhost:1313', 
	'http://localhost:8888', 
	'https://techlockdown.com',
	'https://pmo-dev.netlify.app',
	'https://pmo-stage.netlify.app'
]

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

export const server = app.listen(process.env.PORT || 5000, console.log('App Running'))



const BASE_DIR = path.resolve();
app.get('/', async(req, res) => {
	res.sendFile(path.resolve(path.resolve() +'/index.html'))
})

app.use(bodyParser.json())

// Return host file entries based on skipped items
app.post('/api/info', async(req, res) => {
	let generator = new Generator(req.body)
	let re = await generator.getInfo()
	res.send(JSON.stringify(re))
})

app.post('/api/hosts', async(req, res) => {
		// console.log(req.body)
		// const generator = new Generator(req.body);
		// let blocklist = await generator.getBlocklist();
		// //console.log("hsots files:", blocklist)
		// //let payload = blocklist.text();
		// res.send(blocklist)
})
app.post('/api/download', async(req, res) => {
		let generator = new Generator(req.body)
		let re = await generator.start()
		console.log("Reading temp file...", re.path)
		let readStream = fs.createReadStream(re.path);
		res.set({
			"Content-Type": "application/octet-stream",
			"Content-Disposition": "attachment; filename=blocklist.txt"
		})
		readStream.pipe(res);
			
		readStream.on('end', () => {
			readStream.unpipe(res);
			re.cleanup()
			res.status(200).send();
		});
})
app.get('/api/hosts', async(req, res) => {
		// if (req.query.skip) {
		// 	req.query.skip = req.query.skip.split(",")
		// }
		// const generator = new Generator(req.query);
		// let blocklist = await generator.getCacheMap();
		// console.log("blocklist:", blocklist)
		// //let payload = blocklist.text();
		// res.send(blocklist)
})

