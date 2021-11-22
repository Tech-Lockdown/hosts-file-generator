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
	async getOptions() {
		let map = await this.mapDirectory(this.cacheDir);
		console.log(map)
		return map
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

	async mapDirectory(dir, group = null) {
		const dirents = await fs.readdir(dir, { withFileTypes: true });
		console.log("dirs", dirents)
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
	async generate() {
		const categories = this.getCategories();
		const services = this.getServices();
		const other = await this.getOther();
		console.log("other", other)
		const dir = categories.path;
		const dir1 = services.path;
		const dir2 = other.path;
		const jsonFiles = await categories.files
		const textFiles = await services.files
		const otherFiles = other.files;
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
		for (let k = 0; k < otherFiles.length; k++) {
			let fileLocation = path.resolve(`${dir2}/${otherFiles[k].name}`);
			let fileData = await fs.readFile(fileLocation, "utf8");
			fileData = replaceLines(fileData);

			await this.saveFile(`/${otherFiles[k].name}`, fileData)
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
//generator.generate();
//generator.createHostsFile();
generator.getOptions();
//generator.fetchData();