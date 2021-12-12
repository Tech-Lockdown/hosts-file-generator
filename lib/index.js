import * as utils from "./utils.js"

import path from "path";
import fs from "fs"

export class Generator {
 constructor(srcDir, outputDir) {
	this.srcDir = path.resolve(srcDir)
	this.outputDir = path.resolve(outputDir)
 }


 async start() {
	 let files = await utils.dirMap(this.srcDir)
	 console.log('FILES', files)
 }

 async outputFile(src, destination) {
	let file = new File(src, destination)
	// await file.replaceEachLine(parser.removeStartingIP)
 }


}