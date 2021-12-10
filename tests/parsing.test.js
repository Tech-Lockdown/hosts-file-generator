import path from "path"
import { countLines, removeStartingIP } from "../lib/parser"

describe("Hosts formating tests", () => {
	let host1 = "0.0.0.0     www.mydomain.com"
	let host2 = "127.0.0.1            mydomain.com"
	let comment = "#0.0.0.0            mydomain.com"
	it("remove 0.0.0.0", () => {
		let r = removeStartingIP(host1)
		//console.log(r)
		expect(r).toEqual("www.mydomain.com")
	})

	it("remove 127.0.0.1", () => {
		let r = removeStartingIP(host2)
		//console.log(r)
		expect(r).toEqual("mydomain.com")
	})

	it("Ignore Comment", () => {
		let r = removeStartingIP(comment);
		//console.log(r)
		expect(r).toEqual(comment)
	})
})
