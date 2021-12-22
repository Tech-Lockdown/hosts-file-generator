import path from "path"
import fs from "fs"
import * as utils from "./utils.js"

class Group {
	constructor(name, children = []) {
		this.name = name // String
		this.children = children
	}
	addSubgroup(group) {
		return this.children.push(group)
	}
	createChild(name, path, index = 0) {
		return this.children.splice(index, 0, ({
			name: name,
			path: path.relative,
			count: utils.countLines(path.absolute)
		}))
	}
}
export class DirectoryInfo {
	constructor(baseDir, options = {}) {
		this.baseDir = path.resolve(baseDir)

		this.skipNames = [
			"analytics",
			"security",
			"privacy",
			"blocklists"
		]
		this.options = {
			exclude: [],
			savePath: path.resolve("info.json"),
			...options
		}
	}
	getInfo() {
		if (!fs.existsSync(this.options.savePath)) {
			this.save()
			return this.getInfo()
		}
		return fs.readFileSync(this.options.savePath)
	}
	get excludeItems() {
		return this.options.exclude
	}
	filterInfo() {
		let { children } = JSON.parse(this.getInfo())
		// console.log("children", children)
		return utils.filterNestedArray(children, (item) => {
			let c = this.excludeItems.indexOf(item.name)
			// console.log("Filtering", c, item.name, this.excludeItems)
			// console.log("check if exclude", item.name)
			if (c > -1) {
				this.excludeItems.splice(c, 1)
				return false
			} else {
				// console.log("Keep this item", item.name)
			}
			return true
		})
	}
	walkDirectory(dir = this.baseDir) {
		let dirents = fs.readdirSync(dir, { withFileTypes: true });
		let group = new Group(path.basename(dir))
		let l = 0;
		for (let i = 0; i < dirents.length; i++) {
			let dirent = dirents[i]
			const filePath = path.resolve(dir, dirent.name);
			if (!this.skipNames.includes(dirent.name)) {
				if (dirent.isDirectory()) {
					group.addSubgroup(this.walkDirectory(filePath))
				} else {
					group.createChild(dirent.name, {
						relative: path.relative(this.baseDir, filePath),
						absolute: filePath
					}, l)
					l = i;
				}
			}
		}
		return group
	}
	
	save() {
		fs.writeFileSync(this.options.savePath, JSON.stringify(this.walkDirectory(this.baseDir)))
	}
}