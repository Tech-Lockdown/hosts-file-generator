import { Generator } from "./generate.js"

(async function() {

	//await generator.start();
	const args = process.argv.slice(2)
	console.log(args)
	const generator = new Generator({format: "hosts"})
	generator.test()

	if (args.includes("--blocklist")) {
		const generator = new Generator({
			skip: [
				'analytics',
				'privacy',
				'security',
				'services',
				'dating',
				'gambling',
				'social-networks'
			]
		});
		let files = await generator.createBlocklist();
	}
	if (args.includes("--getblocklist")) {
		const generator = new Generator();
		let blocklist = await generator.getBlocklist();
		console.log(blocklist)
	}
	if (args.includes("--options")) {
		const generator = new Generator({skip: []});
		let cacheMap = await generator.getCacheMap();
		console.log(cacheMap)
	}
	if (args.includes("--getcachemap")) {
		const generator = new Generator();
		let cacheMap = await generator.getCacheMap();
		console.log(cacheMap)
	}
	if (args.includes("--setcachemap")) {
		const generator = new Generator({skip: []});
		generator.skip = [];
		let cacheMap = await generator.setCacheMap();
		console.log(cacheMap)
	}
	if (args.includes("--cache")) {
		const generator = new Generator({
			format: "domains", 
			// skip: [
			// 	'services', 
			// 	'privacy', 
			// 	'security',
			// 	'bypass-methods', 
			// 	'safesearch-not-supported',
			// 	'dating',
			// 	'gambling',
			// 	'piracy',
			// 	'social-networks'
			// ]
			});
		let files = await generator.buildCache();
		console.log(args)
	}
	//generator.createHostsFile();
}())