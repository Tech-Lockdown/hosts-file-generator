import fs from "fs"
import * as utils from "../utils"
import replaceStream from 'replacestream'

export default class Format {
	constructor(src) {
		this.src = src
	}
	startStream() {
		return fs.createReadStream(this.src)
		.pipe(replaceStream(utils.matchRules('comments_and_whitespace'), ""))
	}
	readSrcContent() {
		return 
	}
}