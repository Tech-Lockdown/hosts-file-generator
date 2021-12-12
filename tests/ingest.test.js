// Returns a stream from either the cache or regenerates from data
import fs from "fs";
import path, { resolve } from "path";
import { Ingest } from "../lib/ingest.js"
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

let testCacheFile = path.resolve("./tests/output/cache/domains");
fs.writeFileSync(
	testCacheFile,
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


describe("Cache or data path validation", () => {
	let options = {
		dataDir: path.resolve("./tests/input"),
		cacheDir: path.resolve("./tests/output/cache")
	}
	test("Paths for level = 0", async() => {
		// new Ingest();
		const ingest = new Ingest("./sources.json", options)
		expect(ingest.dataFilePath).toEqual(path.resolve("./tests/input/sources.json"))
		expect(ingest.relativePathWithoutExtension).toEqual("sources")
		expect(ingest.cachedFilePath).toEqual(path.resolve("./tests/output/cache/sources"))
		expect(ingest.src).toEqual(path.resolve("./tests/input/sources.json"))
	})
	test("Paths for level = 1", async() => {
		// new Ingest();
		const ingest = new Ingest("./format/host.txt", options)
		expect(ingest.dataFilePath).toEqual(path.resolve("./tests/input/format/host.txt"))
		expect(ingest.relativePathWithoutExtension).toEqual("format\\host")
		expect(ingest.cachedFilePath).toEqual(path.resolve("./tests/output/cache/format/host"))
		expect(ingest.src).toEqual(path.resolve("./tests/input/format/host.txt"))
		// Expect a cache miss
	})
	test("Cache Hit", async() => {
		// new Ingest();
		const ingest = new Ingest("./domains.txt", options)
		expect(ingest.src).toEqual(path.resolve("./tests/output/cache/domains"))
		// Expect a cache miss
	})
		// let lines = results.toString().match(/\n/gm)
		// expect(lines.length).toEqual(testLineCount*2)
})

describe("Handle Src Types", () => {
	let options = {
		dataDir: path.resolve("./tests/input")
	}
	test("JSON Type", async() => {
		// new Ingest();
		const ingest = new Ingest("./sources.json", options)
		const type = ingest.getDataType()
		expect(type).toEqual("json")
	})
	test("Domains type", async() => {
		// new Ingest();
		const ingest = new Ingest("./formats/domains.txt", options)
		const type = ingest.getDataType()
		expect(type).toEqual("domains")

	})
		// let lines = results.toString().match(/\n/gm)
		// expect(lines.length).toEqual(testLineCount*2)
})

// describe("Generate streams", () => {
// 	test("Should stream without any comments or whitespace", async() => {
// 		const ingest = new Ingest(path.resolve("./tests/input/formats/domains.txt"))

// 		async function readWriteFile() {
// 			return new Promise(async(resolve, reject) => {
// 				let outputPath = path.resolve("./tests/output/domains.txt")
// 				let newFile = fs.createWriteStream(outputPath)
// 				let readStream = await ingest.startReadStream()
// 				readStream.pipe(newFile)
// 				newFile.on("close", () => {
// 					return resolve(outputPath)
// 				})

// 			})
// 		}
// 		let outputPath = await readWriteFile()
// 		let outputFileContents = fs.readFileSync(outputPath)
// 		let lines = outputFileContents.toString().match(/\n/gm)
// 		expect(lines.length).toEqual(testLineCount)

// 	})
// 	test("Combine fetch streams from json sources", async() => {
// 		const ingest = new Ingest(path.resolve(path.resolve("./tests/input/sources.json")))
// 		// const ingest = new Ingest(path.resolve(path.resolve("./data/parentalcontrol/categories/porn.json")))

// 		async function readWriteFile() {
// 			return new Promise(async(resolve, reject) => {
// 				let outputPath = path.resolve("./tests/output/sources.txt")
// 				let newFile = fs.createWriteStream(outputPath)
// 				let readStream = await ingest.startReadStream()
// 				readStream.pipe(newFile)
// 				newFile.on("close", () => {
// 					return resolve(outputPath)
// 				})

// 			})
// 		}
// 		let outputPath = await readWriteFile()
// 		let outputFileContents = fs.readFileSync(outputPath)
// 		let lines = outputFileContents.toString().match(/\n/gm)
// 		// console.log("errors", ingest.errors)
// 		expect(lines.length).toEqual(testLineCount*2)
// 		expect(ingest.errors.length).toEqual(0)

// 	})
// })