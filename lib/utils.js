import fs from "fs/promises";
import { createReadStream } from 'fs';
import path from "path";

export const dirMap = async (dir, baseDir = "./data", skipNames = []) => {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const groupName = path.basename(dir);
	//console.log(groupName)
	let group = {
		name: groupName,
		children: []
	};
	let l = 0;
	for (let i = 0; i < dirents.length; i++) {
		let dirent = dirents[i]
		if (!skipNames.includes(dirent.name)) {
			const filePath = path.resolve(dir, dirent.name);
			if (dirent.isDirectory()) {
				console.log(filePath)
				let subGroup = await dirMap(filePath, baseDir)
				group.children.push(subGroup)
			} else {
				group.children.splice(l, 0, ({
					path: path.relative(path.resolve(baseDir), filePath),
					name: path.parse(dirent.name).name
				}))
				l = i;
			}
		}
	}
	return group
}

export const dataMap = async (dir) => {
	return dirMap(dir, "./data")
}

export const countLines = (path) => {
	return new Promise(async(resolve, reject) => {
		let i;
		let count = 0;
		createReadStream(path)
		.on('data', (chunk) => {
			for (i=0; i < chunk.length; ++i)
				if (chunk[i] == 10) count++;
		})
		.on('end', () => {
			return resolve(count)
		});

	})

}

export const cacheMap = async (dir, skip) => {
	return dirMap(dir, "./cache", skip)
}

export const matchRules = (selection) => {
	let rules = {
		hostsToDomains: /((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9\s]?)){3}|(.*#.*\n)|(^[\s\n]+[\n\s]))/,
		ip: /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/,
		hostname: /(?!(.*#))(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])+[^\s]*/
	}
	return new RegExp(rules[selection], "gm")
}