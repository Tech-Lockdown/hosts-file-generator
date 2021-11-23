// Generate the cache directory
// Fetch any API endpoints referenced in json files
// Update files to point to 0.0.0.0

import fetch from "node-fetch";
import fs from "fs/promises";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import path from "path";
import { dataMap, cacheMap } from "./utils.js"

function replaceEachLine(data, replacementText = "0.0.0.0 ") {
	return data.replace(/^(?!#)(?!\s*$).*/gm, replacementText + "$&")
}
const BASE_DIR = path.resolve();

class Generator {
	constructor(options = {}) {
		this.skip = ["analytics", "exclusions", "protected-domains", "disguised-trackers", "gafam"],
		this.options = {
			overwrite: true,
			format: "hosts",
			skip: ["threat-intelligence-feeds", "280blocker", "chef-koch-spotify"],
			...options
		}
		this.cacheDir = path.resolve(BASE_DIR + "/cache")
		this.dataPath = path.resolve(BASE_DIR + "/data")
		this.blocklistCache = "";
	}
	async start() {
		let data = await dataMap(this.dataPath)
		return this.generateFiles(data.children)
	}
	async generateFiles(data) {
		for (const item of data) {
			const targetDir = path.resolve(this.cacheDir + "/" + item.name)
			//await !fs.exists(targetDir)??fs.mkdir()
			if (item.hasOwnProperty("children")) {
				if (!this.skip.includes(item.name) && !this.options.skip.includes(item.name)) {
					await this.generateFiles(item.children)
				}
			}
			if (item.hasOwnProperty("path")) {
				let srcContent = await this.getFileContent(path.resolve(this.dataPath + "/" + item.path))
				if (srcContent) {
					this.createFile(item.path, srcContent)
				}
			}
		}
	}
	async getFileContent(itemPath) {
		const extension = path.parse(itemPath).ext;
		let src = readFileSync(itemPath, "utf8")
		let fileName = path.parse(itemPath).name;
		if (this.skip.includes(fileName) || this.options.skip.includes(fileName)) {
			console.log("Skipping....", itemPath)
			return false
		}
		if (extension === ".json") {
			const js = JSON.parse(src)
			if (!Array.isArray(js) && js.hasOwnProperty("sources")) {
				src = await this.handleSources(js.sources)
			}
			if (!Array.isArray(js) && js.hasOwnProperty("source")) {
				src = await this.handleSource(js.source)
			}
		} else {
			console.log("normal file", itemPath)
			src = replaceEachLine(src)
		}
		return src;

	}
	async handleSource(source) {
		let fileContent = await this.fetchData(source.url);
		if (source.format !== "hosts" && source.format !== "domains") {
			return false
		}
		if (source.format === "domains") {
			fileContent = replaceEachLine(fileContent)
		}
		return fileContent;
	}
	async handleSources(sources) {
		let data = '';
		for (const source of sources) {
			let content = await this.handleSource(source)
			if (content) {
				data+=content
			}
		}
		return data;
	}
	createFile(itemPath, content) {
		const targetDir = path.resolve(this.cacheDir + "/" + path.dirname(itemPath));
		const extension = path.parse(itemPath).ext;
		if (!existsSync(targetDir)) {
			mkdirSync(targetDir, { recursive: true })
		}
		writeFileSync(path.resolve(this.cacheDir + "/" + itemPath.replace(extension, "")), content)
	}
	async fetchData(src) {
		try {
			console.log("fetching...", src)
			const response = await fetch(src)
			const data = await response.text();
			return Promise.resolve(data);
		} catch(err) {
			console.log("fetchData err", err)
			return Promise.resolve("")
		}
	}
	saveFile(relativePath, data) {
		relativePath = path.resolve(`${this.cacheDir}/${relativePath}`)
		fs.writeFile(`${relativePath}.txt`, data)
	}

	async getBlocklist() {
		let cache = await cacheMap(this.cacheDir)
		return this.concatFiles(cache.children, false)
	}

	async createBlocklist() {
		let cache = await cacheMap(this.cacheDir)
		return this.concatFiles(cache.children)
	}
	async concatFiles(files, saveFile = true) {
		let blocklistPath = path.resolve(`${path.resolve()}/blocklist`);
		await fs.writeFile(blocklistPath, "");
		for (const file of files) {
			if (file.hasOwnProperty("children")) {
				if (!this.options.skip.includes(file.name) && !this.skip.includes(file.name)) {
					await this.concatFiles(file.children, saveFile)
				}
			}
			if (file.hasOwnProperty("path")) {
				// If not skipping the file
				if (!this.options.skip.includes(file.name) && !this.skip.includes(file.name)) {
					let contents = await fs.readFile(path.resolve(this.cacheDir + "/" + file.path))
					if (saveFile) {
						await fs.appendFile(blocklistPath, contents)
					} else {
						contents = contents.toString();
						this.blocklistCache+=contents
					}
				}
			}
		}
		if (!saveFile) {
			return this.blocklistCache
		}
	}

}
const generator = new Generator();
(async function() {
	//await generator.start();
	const args = process.argv.slice(2)
	console.log(args)
	if (args.includes("--blocklist")) {
		let files = await generator.createBlocklist();
	}
	if (args.includes("--getblocklist")) {
		let blocklist = await generator.getBlocklist();
		console.log(blocklist)
	}
	if (args.includes("--cache")) {
		let files = await generator.start();
		console.log(args)
	}
	//generator.createHostsFile();
}())
//generator.fetchData();