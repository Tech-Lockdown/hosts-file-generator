export const createTestHostsFile = (lineCount, prefix = "127.0.0.1     ", suffix = "website.com", comments = true) => {
	let string = "";
	for (let i = 0; i < lineCount; i++) {
		string+=`${prefix}${i}${suffix} \n`
		if (comments) {
			if(i === 10) {
				string+=`

				# A BIG COMMENT MULTILINE COMMENT
				# A BIG COMMENT MULTILINE COMMENT
				# A BIG COMMENT MULTILINE COMMENT
				# A BIG COMMENT MULTILINE COMMENT
				# A BIG COMMENT MULTILINE COMMENT
				# A BIG COMMENT MULTILINE COMMENT
				# A BIG COMMENT MULTILINE COMMENT

				`
			}
		}
	}
	return string
}