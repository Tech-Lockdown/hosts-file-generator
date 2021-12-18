import path from "path"
import fs from "fs"
import { Generator } from "../generator"

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
	test("Multiple paths", async() => {
		let generator = new Generator({
			// exclude: ["blocklists", "dating", "gambling", "piracy", "privacy"],
			exclude: ["blocklists", "categories"],
			blocklist_path: path.resolve("./tests/output/blocklist_test")
		})
		let re = await generator.start()
		console.log(re)
		let contents = fs.readFileSync(path.resolve(re.path), "utf8")
		// console.log(contents)
	})
})