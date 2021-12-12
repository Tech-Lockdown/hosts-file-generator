// Handle src files before they are cached
// Use this to parse JSON files and existing domain files before converting to output
import path from "path"
import { Json, Domains } from "./format"
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
			...options
		}
		console.log(this.options)
	}
	get cachedFilePath() {
		return path.resolve(path.join(this.options.cacheDir, this.relativePathWithoutExtension))
	}
	get dataFilePath() {
		return path.resolve(path.join(this.options.dataDir, this.relativePath))
	}
	get src() {
		return fs.existsSync(this.cachedFilePath) ? this.cachedFilePath : this.dataFilePath;
	}
	async startReadStream() {
		// Need to pipe multiple responses into one stream
		if (this.getDataType() === "json") {
			const jsonFormat = new Json(this.src)
			this.errors = jsonFormat.errors
			return Promise.resolve(jsonFormat.startStream())

		}
			const domainsFormat = new Domains(this.src)
			return Promise.resolve(domainsFormat.startStream())
			// const jsonFormat = new Json(this.src)
			// return await jsonFormat.getContent()
	}
	getDataType() {
		let ext = path.parse(this.src).ext
		if (ext === ".json") {
			return "json"
		}
		return "domains"
	}



	

}