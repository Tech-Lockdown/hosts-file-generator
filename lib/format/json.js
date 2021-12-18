import Format from "./base.js"
import axios from "axios";
import fs from "fs"
import replaceStream from 'replacestream'
import * as utils from "../utils.js"
import MultiStream from "multistream"

export default class Json extends Format {
	constructor(src) {
		super(src)
		this.errors = []
	}
	async startStream() {
		try {
			let streams = await this.getStreams()
			let multistream = new MultiStream(streams)
			multistream = multistream.pipe(replaceStream(utils.matchRules('hostsToDomains'), "", { encoding: 'utf8' }))
			// console.log("MM", multistream)

			return Promise.resolve(multistream)
		} catch(err) {
			console.log("start stream err", err)
			return Promise.reject(JSON.stringify(err))
		}
	}
	async getStreams() {
		try {
			let streams = [];
			let sources = this.getSources().filter(source => source.format === "hosts" || source.format === "domains")
			console.log("sources", sources)
			for (const src of sources) {
				let validStream = await this.fetchSrcAsStream(src.url)
				if (validStream) {
					streams.push(validStream)
				}
			}
			return Promise.resolve(streams)
		} catch(err) {
			console.warn(err)
			return Promise.reject(err)
		}
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
				responseType: 'stream',
				timeout: 2000
			})
			return Promise.resolve(data)
		} catch(err) {
			this.errors.push(src)
			return Promise.resolve(false)
		}
	}
}