// Handle src files before they are cached
// Use this to parse JSON files and existing domain files before converting to output
import path from "path"
import { Json, Domains } from "./format"

export class Ingest {
	constructor(src, options) {
		this.src = src
		this.ext = path.parse(src).ext
		this.errors = [];


		this.options = {
			// Download, memory, file
			output: "memory",
			...options
		}
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
		if (this.ext === ".json") {
			return "json"
		}
		return "domains"
	}



	

}