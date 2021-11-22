import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

function replaceLines(data) {
	return data.replace(/^(?!#)(?!\s*$).*/gm, "0.0.0.0 " + "$&")
}
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
	get servicesDir() {
		return path.resolve(`${this.dataDir}/parentalcontrol/services`);
	}
	getServices() {
		console.log("services dir", this.servicesDir)
		const dir = this.servicesDir
		const files = fs.readdir(dir);
		return {
			path: dir,
			files: files
		}
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
	async getOther() {
		let base = `${path.resolve()}/data/parentalcontrol`;
		let all = await fs.readdir(base, { withFileTypes: true})
		//console.log("all", all)
		return {
			path: path.resolve(base),
			files: all.filter(item => !item.isDirectory() )
		}

	}
	static async fetchData(src) {
		const response = await fetch(src)
		const data = await response.text();
		return data
	}
	saveFile(relativePath, data) {
		relativePath = path.resolve(`${this.cacheDir}/${relativePath}`)
		fs.writeFile(`${relativePath}.txt`, data)
	}
	async generate() {
		const categories = this.getCategories();
		const services = this.getServices();
		const other = await this.getOther();
		console.log("other", other)
		const dir = categories.path;
		const dir1 = services.path;
		const jsonFiles = await categories.files
		const textFiles = await services.files
		console.log("json file", dir, jsonFiles)
		for (let i = 0; i < jsonFiles.length; i++) {
			let fileLocation = path.resolve(`${dir}/${jsonFiles[i]}`);
			let fileData = await fs.readFile(fileLocation, "utf8");
			await this.sources(`/categories/${path.parse(jsonFiles[i]).name}`, fileData)
		}
		for (let l = 0; l < textFiles.length; l++) {
			let fileLocation = path.resolve(`${dir1}/${textFiles[l]}`);
			let fileData = await fs.readFile(fileLocation, "utf8");
			fileData = replaceLines(fileData);

			await this.saveFile(`/services/${path.parse(textFiles[l]).name}`, fileData)
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