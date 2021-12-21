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
		utils.walker(results.children, (item) => {
			if (item.name !== "9gag") {
				unchecked.push(item.name)
			}
		})

				// console.log("unchecked", unchecked)
		let generator = new Generator({
			exclude: unchecked,
			blocklist_path: path.resolve("./tests/output/blocklist_test")
		})
		// console.log(generator)
		// let re = await generator.start()
		let re = await generator.getInfo()
		console.log("info", re)
		// let contents = fs.readFileSync(path.resolve(re.path), "utf8")
		// console.log(contents)
	})
})