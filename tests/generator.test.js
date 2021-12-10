import { Generator } from "../lib/"
import path from "path"

describe("Generator", () => {
	it("Generate File", async() => {
		let generator = new Generator("./tests/input/generator", "./tests/output/generator")
		await generator.outputFile(
			path.resolve("./tests/input/hosts_format.txt"),
			path.resolve("./tests/output/domains_format.txt")
		)
	})
})