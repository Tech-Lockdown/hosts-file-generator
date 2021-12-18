import fs from "fs"
import * as utils from "../utils.js"
import replaceStream from 'replacestream'

export default class Format {
	constructor(src) {
		this.src = src
	}
	startStream() {
			let stream = fs.createReadStream(this.src)
			stream = stream.pipe(replaceStream(utils.matchRules('comments_and_whitespace'), ""))
			return Promise.resolve(stream)
	}
	readSrcContent() {
		return 
	}
}