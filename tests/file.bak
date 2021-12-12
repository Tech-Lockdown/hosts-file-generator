import { File } from "../lib/file"
import path from "path"
import fs from "fs"
import * as testUtils from "./utils"
import * as utils from "../lib/utils.js"

// TEST SETUP
let testOutput = path.resolve("./tests/output/file/read_each_line.txt");
let testInput = path.resolve("./tests/input/file/read_each_line.txt");
let testLineCount = 9999;
// Create a test file from test contents
fs.writeFileSync(
	testInput,
	testUtils.createTestHostsFile(testLineCount)
)

if (testLineCount > 100000) {
	jest.setTimeout(8000)
}

afterAll(() => {
	// Remove test file each time
	if (fs.existsSync(testOutput)) {
		fs.rmdirSync(path.resolve("tests/output/file"), { recursive: true } )
		console.log("!!Clearing Test Output Files!!")
	}
});


describe("Read file", () => {
	let file = new File(testInput, path.resolve("./tests/output/file"))

	test("Remove whitespace, comments, and IP Addresses", async() => {
		let pattern = utils.matchRules('hostsToDomains')
		await file.replaceAll(() => pattern, () => "")	
		let nf = fs.readFileSync(testOutput)
		let matches = nf.toString().match(/\n/gm)
		expect(matches.length).toEqual(testLineCount)
	})
})