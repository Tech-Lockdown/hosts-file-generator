import fs from 'fs';
import path from "path"
import { promisify } from 'util'
import replaceStream from 'replacestream'

export class File {
	constructor(src, outputDir) {
		this.src = src

		// this.options = {
		// 	outputDir: "tests/output"
		// }
		this.fileName = path.parse(src).name;
		this.fileExtension = path.parse(src).ext;
		this.outputPath = path.join(outputDir, this.fileName + this.fileExtension)
		this.lineCount = 0;
		this.init(outputDir)	
	}
	init(outputDir) {
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true })
		}
	}
	async writeLine(stream, text) {
		return new Promise((resolve, reject) => {
			try {
				stream.write(text, resolve)
			} catch(err) {
				return reject("Failed to writeLine " + JSON.stringify(err))
			}
		})
	}
	async replaceAll(matcher, replaceFn) {
		return new Promise((resolve, reject) => {
			try {
				let newFile = fs.createWriteStream(this.outputPath, "utf8")
				fs.createReadStream(this.src)
				.pipe(replaceStream(matcher(), replaceFn))
				.pipe(newFile);
				newFile.on("error", (err) => {
					Promise.reject(JSON.stringify(err))
				})
				newFile.on("close", () => {
					return resolve()
				})
			} catch(err) {
				return Promise.reject(JSON.stringify("Error writing file", err))
			}
		})

	}
	reader(writer, onEnd) {
		try {
			return new Promise((resolve, reject) => {
				let reader = fs.createReadStream(this.src, "utf8")
				reader.on("data", writer)
				reader.on('close', ()=>{
					resolve()
				})
			})
		} catch(err) {
			return reject(JSON.stringify("readEachLine error", err))

		}
	}
}