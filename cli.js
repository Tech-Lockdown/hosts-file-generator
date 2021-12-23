import { Generator } from "./generator.js"
import fs from "fs"

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
		fs.createReadStream(blocklist.path).pipe(process.stdout)
	}
	//generator.createHostsFile();
}())