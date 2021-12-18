// import fs from "fs/promises";
import fs from 'fs';
import path from "path";

export const countLines = (path) => {
	return new Promise(async(resolve, reject) => {
		let i;
		let count = 0;
		fs.createReadStream(path)
		.on('data', (chunk) => {
			for (i=0; i < chunk.length; ++i)
				if (chunk[i] == 10) count++;
		})
		.on('end', () => {
			return resolve(count)
		});

	})
}

export const walk = (directory, cb) => {
	return new Promise(async(resolve, reject) => {
		let items = []
		for (const item of directory) {
		//  cb(item)
			await cb(item)
			if (item?.children) await walk(item.children, cb)
		}
		return resolve(items)
	})
}

export const matchRules = (selection) => {
	let rules = {
		hostsToDomains: /((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\s+|(.*#.*\n)|(^[\s\n]+[\n\s]))/,
		comments_and_whitespace: /(.*#.*\n)|(^[\s\n]+[\n\s])/,
		ip: /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\s+/,
		hostname: /(?!(.*#))(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])+[^\s]*/
	}
	return new RegExp(rules[selection], "gm")
}