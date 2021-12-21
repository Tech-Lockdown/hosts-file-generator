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
	filterInfo() {
		let info = JSON.parse(this.getInfo())
		return utils.filterNestedArray(info, (item) => {
			if (!this.options.exclude.includes(item.name)) {
				this.options.exclude.splice(this.options.exclude.indexOf(item.name), 1)
				return true
			}
			return false
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