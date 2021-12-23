import { Ingest } from "./lib/ingest.js"
import { DirectoryInfo } from "./lib/info.js"
import { routeStream } from "./lib/stream_router.js"
import fs, { Dir, existsSync } from "fs"
import path from "path"
import * as utils from "./lib/utils.js"
import MultiStream from "multistream"

export class Generator {
	constructor(options = {}, name) {

		this.options = {
			baseDir: path.resolve("data"),
			cacheDir: path.resolve("cache"),
			exclude: [],
			output_type: "download",
			...options
		}
		this.name = name

	}
	createCachedFile(relativePath, stream) {
		relativePath = relativePath.replace(/\.json/, '')
		return new Promise(async(resolve, reject) => {
			const targetPath = path.resolve(this.options.cacheDir, relativePath)
			const targetDir = path.dirname(targetPath);
			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir, { recursive: true })
			}
			let newFile = fs.createWriteStream(targetPath)
			stream.pipe(newFile)
			newFile.on("close", () => {
				return resolve(targetPath)
			})

		})
	}
	fetchLatestSources() {
		return new Promise(async(resolve, reject) => {
			let fileMap = this.getInfo()
			let count = 0;
			await this.asyncWalk(fileMap, async(child) => {
				if (child.path) {
					console.log("path", child.path)
					let ingest = new Ingest(child.path, { ignoreCache: true })
					let stream = await ingest.startReadStream()
					let cachedPath = this.createCachedFile(child.path, stream)
					count++
					// console.log("Stream ingested", stream.readable)
					// if (stream.readable) {
						// streams.push(stream)
					// }
				}
			})
			return resolve()
		})
	}
	fetchInfo() {
		let info = new DirectoryInfo(this.options.baseDir)
		if (existsSync(info.options.savePath)) {
			fs.rmSync(info.options.savePath)
		}
		return this.getInfo()
	}
	getInfo() {
		let exclude = this.options.exclude
		let info = new DirectoryInfo(this.options.baseDir, {
			exclude: exclude
		})
		// console.log(this.name, info)
		// console.log("Exclude", exclude)
		return info.filterInfo();
	}
	createBlocklist() {
		return new Promise(async(resolve, reject) => {
			let fileMap = this.getInfo()
			// console.log("fileMap", fileMap)
			let streams = [];
			await this.asyncWalk(fileMap, async(child) => {
				if (child.path) {
					let ingest = new Ingest(child.path, { ignoreCache: false })
					let stream = await ingest.startReadStream()
					// console.log("Stream ingested", stream.readable)
					// if (stream.readable) {
						streams.push(stream)
					// }
				}
			})
			// let testPath = fileMap[0].children[0].path
				// console.log("test path", testPath)
			// console.log("streams", streams.length)
			let readStream = new MultiStream(streams)
			// console.log("streams", readStream)
			return resolve(routeStream(readStream))
		})
	}
	asyncWalk(fileMap, cb) {
		return new Promise(async(resolve, reject) => {
			await utils.walk(fileMap, cb)
			return resolve()

		})

	}
	start() {
		return new Promise(async(resolve, reject) => {
			let stuff = await this.createBlocklist()
				return resolve(stuff)
		})
	}

}