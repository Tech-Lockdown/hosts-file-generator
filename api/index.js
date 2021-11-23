import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

function replaceLines(data) {
	return data.replace(/^(?!#)(?!\s*$).*/gm, "0.0.0.0 " + "$&")
}
async function getOptions() {
	let map = await this.mapDirectory(this.cacheDir);
	console.log(map)
	return map
}