import fs from "fs"

class Output {
	constructor(readStream) {
		this.readStream	= readStream
	}
	start() {
		return new Promise((resolve, reject) => {
			this.readStream.pipe(newFile)
			newFile.on("close", () => {
				return resolve(outputPath)
			})
		})
	}
	createFile() {
		fs.createWriteStream(// some output location)
	}
}
export const exportStream = (inputStream) => {
	let output = new Output()
}