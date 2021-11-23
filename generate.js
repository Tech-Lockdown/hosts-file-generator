// Generate the cache directory
// Fetch any API endpoints referenced in json files
// Update files to point to 0.0.0.0

import fetch from "node-fetch";
import fs from "fs/promises";
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import path from "path";
import { dataMap } from "./utils.js"

function replaceEachLine(data, replacementText = "0.0.0.0 ") {
	return data.replace(/^(?!#)(?!\s*$).*/gm, replacementText + "$&")
}
const BASE_DIR = path.resolve();

class Generator {
	constructor(options = {}) {
		this.skip = ["exclusions", "protected-domains", "disguised-trackers", "gafam"],
		this.options = {
			overwrite: true,
			format: "hosts",
			skip: ["threat-intelligence-feeds", "cryptojacking", "280blocker", "chef-koch-spotify"],
			...options
		}
		this.cacheDir = path.resolve(BASE_DIR + "/cache")
		this.dataPath = path.resolve(BASE_DIR + "/data")
		this.cache = {};
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
				await this.generateFiles(item.children)
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

	async mapDirectory(dir = this.dataDir, group = null) {
		const dirents = await fs.readdir(dir, { withFileTypes: true });
		let items = [];
		for (const dirent of dirents) {
			const res = path.resolve(dir, dirent.name);
			//console.log(res)
			if (dirent.isDirectory()) {
				let files = await this.mapDirectory(res)
				items.push(files)
			} else {
				items.push(res)
			}
		}
		return items;
	}
	async createHostsFile(selected) {
		let blocklistPath = path.resolve(`${path.resolve()}/blocklist`);
		await fs.writeFile(blocklistPath, "");

		let files = await this.mapDirectory(this.cacheDir)
		files = files.flat();
		for (const file of files) {
			console.log("file", file)
			let contents = await fs.readFile(file);
			await fs.appendFile(blocklistPath, contents)
		}
	}

}
const generator = new Generator();
(async function() {
	await generator.start();
	//generator.createHostsFile();
	//console.dir(cache)
}())
//generator.fetchData();