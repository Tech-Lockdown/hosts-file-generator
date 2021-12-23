import tmp from "tmp-promise"
import path from "path"
import fs from "fs"

// tmp.setGracefulCleanup();
const tempOptions = {
	tmpdir: path.resolve("tmp")
}

export class Download {
	constructor(stream, options) {
		this.stream = stream
	}
	create() {
		return new Promise(async(resolve, reject) => {
			try {
				let tempFile = await tmp.file(tempOptions)
				let newFile = fs.createWriteStream(tempFile.path)
				newFile.on("close", () => {
					console.log("DOWNLOAD RESOLVED")
					return resolve(tempFile)
				})
				this.stream.pipe(newFile)
				console.log("Almost Finished creating download...")
			} catch(err) {
				console.log("Download Create Err", err)
				return reject(JSON.stringify(err))
			}

		})
	}
}

export const routeStream = (readStream, options = {}) => {
	let defaultOptions = {
		output_target: "download",
		...options
	}
	if (defaultOptions.output_target === "download") {
		let download = new Download(readStream)
		return download.create()
	}
}