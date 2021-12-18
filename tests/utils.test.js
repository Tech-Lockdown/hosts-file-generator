import * as utils from "../lib/utils"


let nestedArray = [
    {
        name: "subdomains",
        path: "path.js"
    },
    {
        name: "parentalcontrol",
        children: [
            {
                name: "blocklist",
                children: [
                    {
                        name: "analytics",
                        path: "path"
                    }
                ]
            },
            {
                name: "categories",
                path: "path 2"
            },
            {
                name: "piracy",
                path: "path 2"
            }
        ]
    }
]

function getNestedCount(nArray) {
    let count = 0;
    utils.walker(nArray, (item) => {
        count++
    })
    return count
}

describe("Nested array", () => {
    test("Exclude a file", () => {
        let excludeNames = [
            "piracy"
        ]
        let inputCount = getNestedCount(nestedArray)
        let finalArray = utils.filterNestedArray(nestedArray, (item) => {
            return !excludeNames.includes(item.name)
        })
        console.log("final array", finalArray)
        console.log("Input count: ", inputCount, "Excluded count: ", excludeNames.length, "Filtered Count: ", getNestedCount(finalArray))
        expect(getNestedCount(finalArray)).toEqual(inputCount - excludeNames.length)
        // expect(finalArray)
    })
})