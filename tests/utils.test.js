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
                        name: "analytics.json",
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

const newNestedArray = (arr) => {
    return JSON.parse(JSON.stringify(arr))
}

function getNestedCount(nArray) {
    let count = 0;
    utils.walker(nArray, (item) => {
        count++
    })
    return count
}

describe("Nested array", () => {
    test("Exclude a file", () => {
        const testArray = newNestedArray(nestedArray)
        let excludeNames = [
            "piracy"
        ]
        let finalArray = utils.filterNestedArray(testArray, (item) => {
            return !excludeNames.includes(item.name)
        })
        utils.walker(finalArray, (item) => {
            // console.log(item)
            expect(excludeNames.includes(item.name)).toBe(false)
        })
        console.log(finalArray)
        // expect(finalArray)
    })
    test("Exclude a json file", () => {
        const testArray = newNestedArray(nestedArray)
        let excludeNames = [
            "analytics.json"
        ]
        let finalArray = utils.filterNestedArray(testArray, (item) => {
            return !excludeNames.includes(item.name)
        })
        utils.walker(finalArray, (item) => {
            // console.log(item)
            expect(excludeNames.includes(item.name)).toBe(false)
        })
        console.log(finalArray)
        // expect(finalArray)
    })
})