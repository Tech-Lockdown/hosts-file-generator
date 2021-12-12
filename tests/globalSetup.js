import { app } from "../server.js"
import fs from "fs"
import path from "path"

export default () => {
	app.get('/tests/formats/host', async(req, res) => {
		try {
			let target = path.resolve("./tests/input/formats/host.txt")
			// console.log("target", target)
			let dataFile = fs.readFileSync(target)
			res.send(dataFile)
		} catch(err) {
			console.log("FETCHING ERROR", err)
		}
	})
	app.get('/tests/formats/domains', async(req, res) => {
		try {
			let target = path.resolve("./tests/input/formats/domains.txt")
			// console.log("target", target)
			let dataFile = fs.readFileSync(target)
			res.send(dataFile)
		} catch(err) {
			console.log("FETCHING ERROR", err)
		}
	})
};