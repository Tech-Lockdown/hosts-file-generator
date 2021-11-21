import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

class Generator {
	constructor() {

	}
	get cacheDir() {
		return path.resolve(`${path.resolve()}/cache`);
	}
	get dataDir() {
		return `${path.resolve()}/data`;
	}
	get categoriesDir() {
		return path.resolve(`${this.dataDir}/parentalcontrol/categories`);
	}
	getCategories() {
		console.log("categories dir", this.categoriesDir)
		const dir = this.categoriesDir
		const files = fs.readdir(dir);
		return {
			path: dir,
			files: files
		}
	}
	static async fetchData(src) {
		const response = await fetch(src)
		const data = await response.text();
		return data
	}
	saveFile(fileName, data) {
		this.cacheDir
		fs.writeFile(`${this.cacheDir}/${path.parse(fileName).name}.txt`, data)
	}
	async generate() {
		const categories = this.getCategories();
		const dir = categories.path;
		const jsonFiles = await categories.files
		console.log("json file", dir, jsonFiles)
		for (let i = 0; i < jsonFiles.length; i++) {
			let fileLocation = path.resolve(`${dir}/${jsonFiles[i]}`);
			let fileData = await fs.readFile(fileLocation, "utf8");
			//console.log(fileData)
			await this.sources(jsonFiles[i], fileData)
		}
	}
	async sources(fileName, file) {
		let json = await JSON.parse(file)
		let sources = json.sources
		for (let i = 0; i < sources.length; i++) {
			console.log("fetching...", sources[i])
			let response = await fetch(sources[i].url);
			let data = await response.text();
			//console.log("data", data)
			if (sources[i].format !== "hosts") {
				data = data.replace(/^(?!#)(?!\s*$).*/gm, "0.0.0.0 " + "$&")
			}
			//console.log(data)
			await this.saveFile(fileName, data)
		}

	}
}
const generator = new Generator();
generator.generate();
//generator.fetchData();