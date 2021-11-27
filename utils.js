import fs from "fs/promises";
import path from "path";

const dirMap = async (dir, baseDir = "./data", skipNames = []) => {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const groupName = path.basename(dir);
	//console.log(groupName)
	let group = {
		name: groupName,
		children: []
	};
	for (const dirent of dirents) {
		if (!skipNames.includes(dirent.name)) {
			const filePath = path.resolve(dir, dirent.name);
			if (dirent.isDirectory()) {
				console.log(filePath)
				let subGroup = await dirMap(filePath, baseDir)
				group.children.push(subGroup)
			} else {
				group.children.push({
					path: path.relative(path.resolve(baseDir), filePath),
					name: path.parse(dirent.name).name
				})
			}
		}
	}
	return group
}

export const dataMap = async (dir) => {
	return dirMap(dir, "./data")
}

export const cacheMap = async (dir, skip) => {
	return dirMap(dir, "./cache", skip)
}