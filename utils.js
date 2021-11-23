import fs from "fs/promises";
import path from "path";

export const dataMap = async (dir) => {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const groupName = path.basename(dir);
	//console.log(groupName)
	let group = {
		name: groupName,
		children: []
	};
	for (const dirent of dirents) {
		const filePath = path.resolve(dir, dirent.name);
		if (dirent.isDirectory()) {
			console.log(filePath)
			let subGroup = await dataMap(filePath)
			group.children.push(subGroup)
		} else {
			group.children.push({
				path: path.relative(path.resolve("./data"), filePath),
				name: path.parse(dirent.name).name
			})
		}
	}
	return group
}