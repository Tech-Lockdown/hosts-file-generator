import path from "path"
import fs from "fs"
import { Generator } from "../generator"
import * as utils from "../lib/utils"

afterAll(() => {
	const outputs = [
		path.resolve("./tests/output/blocklist_test"),
	]
	for (const output of outputs) {
		if (fs.existsSync(output)) {
			// fs.rmSync(output)
		}
	}
})

describe("Start Generation", () => {
	test("Block one application", async() => {

		const info = new Generator()
		let results = await info.getInfo()

		let unchecked = []
		let tests = [
			"9gag",
			"services",
			"parentalcontrol"
		]
		utils.walker(results, (item) => {
			if (item.name !== "9gag" && item.name !== "parentalcontrol" && item.name !== "services") {
				unchecked.push(item.name)
			}
		})
		// console.log("unchecked", unchecked)
		expect(unchecked.length > 0)

		let generator = new Generator({
			exclude: unchecked,
			blocklist_path: path.resolve("./tests/output/blocklist_test")
		})
		// console.log("unchcked", unchecked)
		// console.log(generator)
		// let re = await generator.start()
		let re = await generator.getInfo()
		utils.walker(re, (item) => {
			expect(tests.includes(item.name)).toBe(true)
		})
		// console.log("info", re)
		// let contents = fs.readFileSync(path.resolve(re.path), "utf8")
		// console.log(contents)
	})
})