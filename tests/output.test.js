import fs from "fs";
import path from "path";
import { Output } from "../lib/output.js"
import * as testUtils from "./utils"

let testHostsInput = path.resolve("./tests/input/formats/host.txt");

let testLineCount = 100;
fs.writeFileSync(
	testHostsInput,
	testUtils.createTestHostsFile(testLineCount)
)

let testDomainsInput = path.resolve("./tests/input/formats/domains.txt");
fs.writeFileSync(
	testDomainsInput,
	testUtils.createTestHostsFile(testLineCount, "")
)

afterAll(() => {
	// Remove test file each time
	let output1 = path.resolve("./tests/output/domains.txt")
	let output2 = path.resolve("./tests/output/sources.txt")
	if (fs.existsSync(output1)) {
		fs.rmSync(output1)
		console.log("!!Clearing Test Output Files!!")
	}
	if (fs.existsSync(output2)) {
		fs.rmSync(output2)
		console.log("!!Clearing Test Output Files!!")
	}
});



describe("Handle Src Types", () => {
	test("JSON Type", async() => {
		// new Ingest();
		const ingest = new Ingest(path.resolve("./tests/input/sources.json"))
		const type = ingest.getDataType()
		expect(type).toEqual("json")
	})
	test("Domains type", async() => {
		// new Ingest();
		const ingest = new Ingest(path.resolve("./tests/input/formats/domains.txt"))
		const type = ingest.getDataType()
		expect(type).toEqual("domains")

	})
		// let lines = results.toString().match(/\n/gm)
		// expect(lines.length).toEqual(testLineCount*2)
})

describe("Generate streams", () => {
	test("Should stream without any comments or whitespace", async() => {
		const ingest = new Ingest(path.resolve("./tests/input/formats/domains.txt"))

		async function readWriteFile() {
			return new Promise(async(resolve, reject) => {
				let outputPath = path.resolve("./tests/output/domains.txt")
				let newFile = fs.createWriteStream(outputPath)
				let readStream = await ingest.startReadStream()
				readStream.pipe(newFile)
				newFile.on("close", () => {
					return resolve(outputPath)
				})

			})
		}
		let outputPath = await readWriteFile()
		let outputFileContents = fs.readFileSync(outputPath)
		let lines = outputFileContents.toString().match(/\n/gm)
		expect(lines.length).toEqual(testLineCount)

	})
	test("Combine fetch streams from json sources", async() => {
		const ingest = new Ingest(path.resolve(path.resolve("./tests/input/sources.json")))
		// const ingest = new Ingest(path.resolve(path.resolve("./data/parentalcontrol/categories/porn.json")))

		async function readWriteFile() {
			return new Promise(async(resolve, reject) => {
				let outputPath = path.resolve("./tests/output/sources.txt")
				let newFile = fs.createWriteStream(outputPath)
				let readStream = await ingest.startReadStream()
				readStream.pipe(newFile)
				newFile.on("close", () => {
					return resolve(outputPath)
				})

			})
		}
		let outputPath = await readWriteFile()
		let outputFileContents = fs.readFileSync(outputPath)
		let lines = outputFileContents.toString().match(/\n/gm)
		// console.log("errors", ingest.errors)
		expect(lines.length).toEqual(testLineCount*2)
		expect(ingest.errors.length).toEqual(0)

	})
	test("Get a cached file as a stream", async() => {
		const ingest = new Ingest(path.resolve(path.resolve("./tests/input/sources.json")))
		// const ingest = new Ingest(path.resolve(path.resolve("./data/parentalcontrol/categories/porn.json")))

		async function readWriteFile() {
			return new Promise(async(resolve, reject) => {
				let outputPath = path.resolve("./tests/output/sources.txt")
				let newFile = fs.createWriteStream(outputPath)
				let readStream = await ingest.startReadStream()
				readStream.pipe(newFile)
				newFile.on("close", () => {
					return resolve(outputPath)
				})

			})
		}
		let outputPath = await readWriteFile()
		let outputFileContents = fs.readFileSync(outputPath)
		let lines = outputFileContents.toString().match(/\n/gm)
		// console.log("errors", ingest.errors)
		expect(lines.length).toEqual(testLineCount*2)
		expect(ingest.errors.length).toEqual(0)

	})
})