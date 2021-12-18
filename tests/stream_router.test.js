import fs from "fs"
import { routeStream, Download } from "../lib/stream_router.js"
import * as testUtils from "./utils"
import path from "path"

let testFilePath = path.resolve("./tests/input/formats/domains.txt");
let testLineCount = 100;
fs.writeFileSync(
	testFilePath,
	testUtils.createTestHostsFile(testLineCount)
)

afterAll(() => {
	// Remove test file each time
	const outputs = [
		path.resolve("./tests/output/cache/domains"),
	]
	console.log("!!Clearing Test Output Files!!")
	for (const output of outputs) {
		if (fs.existsSync(output)) {
			fs.rmSync(output)
		}
	}
});

describe("Download Test", () => {
	test("New tmp Download", async () => {
		const readStream = fs.createReadStream(testFilePath)
		let download = new Download(readStream)
		let tempFile = await download.create()
		tempFile.cleanup()
	})
})
