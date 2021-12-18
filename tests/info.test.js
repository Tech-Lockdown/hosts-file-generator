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

describe("Get all paths in directory", () => {
	test("Filter info", () => {
		let info = new DirectoryInfo(path.resolve("data"), {
			exclude: ["blocklists"],
			savePath: path.resolve("tests/output/info.json")
		})
		info.save()
		// let file = info.getInfo()
		let file = info.filterInfo()
		// console.log("Dirents", info.walkDirectory())
		walk(file, (item) => {
			expect(item.name).not.toBe("blocklists")
		})

	})
})