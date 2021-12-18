// Generate the cache directory
// Fetch any API endpoints referenced in json files
// Update files to point to 0.0.0.0

import fetch from "node-fetch";
import fs from "fs/promises";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import path from "path";
import { dataMap, cacheMap, countLines } from "./utils.js"

const BASE_DIR = path.resolve();

export class Generator {
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
		this.blocklistPath = path.resolve(`${path.resolve()}/blocklist`);
		this.blocklistCache = "";
	}
	
	async test() {
		let data = await fs.readFile(path.resolve("./cache/parentalcontrol/categories/porn"), "utf-8")
		let matched = this.replaceEachLine(data)
		// console.log(matched)
	}

	replaceEachLine(data, replacementText = "0.0.0.0 ") {
		let pattern = /^(?!#)(?!\s*$).*/gm
		if (this.options.format === "domains") {
			pattern = /^(?!#)(?!\s*$).*/gm
			replacementText = "";
		}
		return data.replace(pattern, function(match, p1, p2, p3, offset, string) {
			match = match.replace(/(0\.0\.0\.0\s|127\.0\.0\.1\s*)/gm, "")
			console.log(match)
			return match
		})
	}


	async walkFiles(files, pathcb) {
		for (const file of files) {
			if (file.hasOwnProperty("children")) {
				if (!this.options.skip.includes(file.name) && !this.skip.includes(file.name)) {
					await this.walkFiles(file.children, pathcb)
				}
			}
			if (file.hasOwnProperty("path")) {
				// If not skipping the file
				if (!this.options.skip.includes(file.name) && !this.skip.includes(file.name)) {
					if (pathcb) {
						await pathcb(file, path.resolve(this.cacheDir + "/" + file.path))
					}
				}
			}
		}
	}
	// Generate the cache directory
	async buildCache() {
		let data = await dataMap(this.dataPath)
		return this.generateFiles(data.children)
	}
	async generateFiles(data) {
		for (const item of data) {
			const targetDir = path.resolve(this.cacheDir + "/" + item.name)
			//await !fs.exists(targetDir)??fs.mkdir()
			if (item.hasOwnProperty("children")) {
				if (!this.shouldSkip(item.name)) {
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
		if (this.shouldSkip(fileName)) {
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
			src = this.replaceEachLine(src)
		}
		return src;

	}
	async handleSource(source) {
		let fileContent = await this.fetchData(source.url);
		// if (source.format !== "hosts" && source.format !== "domains") {
		// 	return false
		// }
		// if (source.format === "domains") {
			fileContent = this.replaceEachLine(fileContent)
		// }
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
			// console.log("fetching...", src)
			const response = await fetch(src)
			if (response.status === 200) {
				const data = await response.text();
				return Promise.resolve(data);
			} else {
				throw "Not found"
			}
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
		let cache = await cacheMap(this.cacheDir, [...this.skip, ...this.options.skip])
		console.log("cache", cache.children)
		return this.concatFiles(cache.children, false)
	}

	async createBlocklist() {
		let cache = await cacheMap(this.cacheDir, [...this.skip, ...this.options.skip])
		let blocklist = await this.concatFiles(cache.children, true)
		await fs.appendFile(this.blocklistPath, "# Blocklist \r\n")
		return blocklist
	}
	async concatFiles(files, saveFile = true) {
		if (saveFile) {
			await fs.writeFile(this.blocklistPath, "# Blocklist \r\n");
		}
		for (let i = 0; i < files.length; i++) {
			let file = files[i]
			if (file.hasOwnProperty("children")) {
				if (!this.shouldSkip(file.name, i)) {
					await this.concatFiles(file.children, saveFile)
				}
			}
			if (file.hasOwnProperty("path")) {
				// If not skipping the file
				if (!this.shouldSkip(file.name, i)) {
					let contents = await fs.readFile(path.resolve(this.cacheDir + "/" + file.path))
					if (saveFile) {
						await fs.appendFile(this.blocklistPath, contents)
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

	shouldSkip(name, i) {
		if (this.options.skip.includes(name)) {
		//console.log("Skip", name)
			//this.options.skip.splice(i, 1)
			return true
		}
		if (this.skip.includes(name))	{
			return true
		}
		return false
	}
	walkInfo(data) {
		for (let i = 0; i < data.length; i++) {
			if (this.shouldSkip(data[i].name, i)) {
				// delete the entry
				data.splice(i, 1)
			}
			if (this.hasOwnProperty("children")) {
				return this.walkInfo(data[i].children)
			}
		}
		return data;
	}
	async getCacheMap() {
		// Returns a map of the cache directory
		// Skips any specified names
		let data = readFileSync("./info.json")
		data = JSON.parse(data)
		return this.walkInfo(data)
	}
	async setCacheMap() {
		let map = await cacheMap(this.cacheDir, [...this.skip, ...this.options.skip])
		await this.walkFiles(map.children, async (file, path) => {
			return new Promise(async(resolve, reject) => {
				let count = await countLines(path)
				file.count = count;
				resolve(count)
			})
		})
		fs.writeFile("./info.json", JSON.stringify(map.children))
		return map.children
	}
}

//generator.fetchData();

