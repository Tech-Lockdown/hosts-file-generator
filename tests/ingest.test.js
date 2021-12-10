import axios from "axios";
// import { Ingest } from "../lib/ingest.js"

const fetchUrl = "http://localhost:5000/test"

describe("Read file", () => {
	test("Remove whitespace, comments, and IP Addresses", async() => {
		// new Ingest();
		let r = await axios.get(fetchUrl)
		console.log(r)
	})
})