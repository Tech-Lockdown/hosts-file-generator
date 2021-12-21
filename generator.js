import { Ingest } from "./lib/ingest.js"
import { DirectoryInfo } from "./lib/info.js"
import { routeStream } from "./lib/stream_router.js"
import path from "path"
import fs from "fs"
import * as utils from "./lib/utils.js"
import MultiStream from "multistream"

export class Generator {
	constructor(options = {}) {

		this.options = {
			baseDir: path.resolve("data"),
			exclude: [],
			output_type: "download",
			...options
		}
		console.log(this.options)

	}
	getInfo() {
		let info = new DirectoryInfo(this.options.baseDir, {
			exclude: this.options.exclude
		})
		return info.filterInfo();
	}
	createBlocklist() {
		return new Promise(async(resolve, reject) => {
			let fileMap = this.getInfo()
			// console.log("fileMap", fileMap)
			let streams = await this.walk(fileMap)
			// let testPath = fileMap[0].children[0].path
				// console.log("test path", testPath)
			// console.log("streams", streams.length)
			let readStream = new MultiStream(streams)
			// console.log("streams", readStream)
			return resolve(routeStream(readStream))
		})
	}
	walk(fileMap) {
		return new Promise(async(resolve, reject) => {
			let streams = [];
			await utils.walk(fileMap, async(child) => {
				if (child.path) {
					let ingest = new Ingest(child.path, { ignoreCache: true })
					let stream = await ingest.startReadStream()
					// console.log("Stream ingested", stream.readable)
					// if (stream.readable) {
						streams.push(stream)
					// }
				}
			})
			return resolve(streams)

		})

	}
	start() {
		return new Promise(async(resolve, reject) => {
			let stuff = await this.createBlocklist()
				return resolve(stuff)
		})
	}

}