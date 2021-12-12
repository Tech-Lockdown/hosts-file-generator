import Format from "./base.js"
import axios from "axios";
import fs from "fs"
import replaceStream from 'replacestream'
import * as utils from "../utils"
import MultiStream from "multistream"

export default class Json extends Format {
	constructor(src) {
		super(src)
		this.errors = []
	}
	async startStream() {
		let streams = await this.getStreams()
		let multistream = new MultiStream(streams)
		multistream = multistream.pipe(replaceStream(utils.matchRules('hostsToDomains'), "", { encoding: 'utf8' }))

		return Promise.resolve(multistream)
	}
	async getStreams() {
		let streams = [];
		let sources = this.getSources()
		for (const src of sources) {
			let validStream = await this.fetchSrcAsStream(src.url)
			if (validStream) {
				streams.push(validStream)
			}
		}
		return Promise.resolve(streams)
	}
	getSources() {
		let ob = JSON.parse(fs.readFileSync(this.src))
		if (ob?.sources) {
			return ob.sources
		}
		if (ob?.source) {
			return Array(ob.source)
		}
	}
	async fetchSrcAsStream(src) {
		try {
			console.log("fetching...", src)
			let { data } = await axios({
				method: 'get',
				url: src,
				contentType: 'text/plain',
				responseType: 'stream'
			})
			return Promise.resolve(data)
		} catch(err) {
			this.errors.push(src)
			return Promise.resolve(false)
		}
	}
}