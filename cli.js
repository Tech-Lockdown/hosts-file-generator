import { Generator } from "./generator.js"
import fs from "fs"
import replaceStream from 'replacestream'

(async function() {

	//await generator.start();
	const args = process.argv.slice(2)

	// Do this whenever data folder changes
	if (args.includes("--fetch")) {
		const generator = new Generator({
			format: "domains", 
		});
		// Regenerate info.json
		generator.fetchInfo()
		// Rebuild cache dir based on info.json
		await generator.fetchLatestSources();
	}
	if (args.includes("--blocklist-create")) {
		const generator = new Generator();
		let blocklist = await generator.start();
		fs.createReadStream(blocklist.path).pipe(replaceStream(/(^[A-Za-z0-9].*)/gm, '127.0.0.1 $1')).pipe(process.stdout)
	}
	//generator.createHostsFile();
}())