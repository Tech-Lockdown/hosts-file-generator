// Handle src files before they are cached
// Use this to parse JSON files and existing domain files before converting to output
import path from "path"
import { Json, Domains } from "./format/index.js"
import fs from "fs"

export class Ingest {
	constructor(relativePath, options) {
		this.relativePath = relativePath
		this.errors = [];

		this.relativePathWithoutExtension = path.join(path.parse(this.relativePath).dir, path.parse(this.relativePath).name)

		this.options = {
			// Download, memory, file
			dataDir: path.resolve("./data"),
			cacheDir: path.resolve("./cache"),
			ignoreCache: false,
			...options
		}
		// console.log(this.options)
	}
	get cachedFilePath() {
		return path.resolve(path.join(this.options.cacheDir, this.relativePathWithoutExtension))
	}
	get dataFilePath() {
		return path.resolve(path.join(this.options.dataDir, this.relativePath))
	}
	get src() {
		if (this.options.ignoreCache) {
			return this.dataFilePath;
		}
		return fs.existsSync(this.cachedFilePath) && fs.statSync(this.cachedFilePath).size > 0 ? this.cachedFilePath : this.dataFilePath;
	}
	async startReadStream() {
		// Need to pipe multiple responses into one stream
		try {
			console.log("Start read stream", this.src)
			if (this.getDataType() === "json") {
				const jsonFormat = new Json(this.src)
				this.errors = jsonFormat.errors
				return Promise.resolve(jsonFormat.startStream())
			}
			const domainsFormat = new Domains(this.src)
			return Promise.resolve(domainsFormat.startStream())

		} catch(err) {
			console.log("Error startReadStream", err)
			return Promise.reject(false)
		}
			// const jsonFormat = new Json(this.src)
			// return await jsonFormat.getContent()
	}
	// createCachedFile(stream) {
	// 	let dir = path.parse(this.cachedFilePath).dir
	// 	if (!fs.existsSync(dir)) {
	// 		fs.mkdirSync(dir, { recursive: true })
	// 	}
	// }
	getDataType() {
		let ext = path.parse(this.src).ext
		if (ext === ".json") {
			return "json"
		}
		return "domains"
	}



	

}