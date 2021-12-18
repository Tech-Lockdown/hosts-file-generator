import { DirectoryInfo } from "../lib/info.js"
import path from "path"
import fs from "fs"

function walk(items, cb) {
	items.forEach(item => {
		cb(item)
		if (item?.children) walk(item.children, cb)
	})
}


afterAll(() => {
	// Remove test file each time
	const outputs = [
		path.resolve("./tests/output/info.json"),
	]
	for (const output of outputs) {
		if (fs.existsSync(output)) {
			fs.rmSync(output)
		}
	}
});

// describe("Get all paths in directory", () => {
// 	test("Filter info", () => {
// 		let info = new DirectoryInfo(path.resolve("data"), {
// 			exclude: ["blocklists"],
// 			savePath: path.resolve("tests/output/info.json")
// 		})
// 		info.save()
// 		// let file = info.getInfo()
// 		let file = info.filterInfo()
// 		// console.log("Dirents", info.walkDirectory())
// 		walk(file, (item) => {
// 			expect(item.name).not.toBe("blocklists")
// 		})

// 	})
// })

describe("Filter Output", () => {
	test("Filter info", () => {
		let items = JSON.parse(fs.readFileSync(path.resolve("tests/input/info.json"), 'utf8'))
		let options = [];
		walk(items.children, (item) => {
			options.push(item.name)
		})
		console.log(options.length)
		const include = options.splice(1, 1)
		console.log("include", include)
		let info = new DirectoryInfo(path.resolve("data"), {
			exclude: options,
			// exclude: ["dating"],
			savePath: path.resolve("tests/output/info.json")
		})
		// let file = info.getInfo()
		let file = info.filterInfo()
		// console.log("Dirents", info.walkDirectory())
		console.log("File", file)
		// walk(file, (item) => {
		// 	expect(item.name).not.toBe("blocklists")
		// })

	})
})