import { createReadStream } from 'fs';
/* 
Ip address: (25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}
*/
export const removeStartingIP = (line) => {
	return line.replace(/^(0.0.0.0\s*|127.0.0.1\s*)/, "")
}
export const removeComment = (line) => {
	return line.replace(/^(#.*)/, "")
}

export const countLines = (path) => {
	return new Promise(async(resolve, reject) => {
		let i;
		let count = 0;
		createReadStream(path)
		.on('data', (chunk) => {
			console.log(chunk.toString())
			for (i=0; i < chunk.length; ++i)
				if (chunk[i] == 10) count++;
		})
		.on('end', () => {
			return resolve(count)
		});

	})

}