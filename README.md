# Hosts file generator
Generate hosts blocklist file based on categories.


Generate the files in the cache directory based on the contents of `./data`. This will fetch all APIs in json files and create files based on generator.options.format (default = hosts).
`npm run generate:cache`

Create a blocklist file containing all entries (that are not skipped) from the cache directory. Override generator.options.skip with file/folder names (do not include extensions) to customize the output.
`npm run generate:blocklist`

Get a map of the cache directory with file/folder names.
`npm run get:options`

*Source files curated from [nextdns.io](https://nextdns.io)*

# nextdns/metadata
---

## Report a false positive (a domain being blocked that shouldn't)
Get in touch with the list maintainer directly (for most blocklists this means creating an issue on the github repository of the list). We try to not interfere with third-party lists and deliver them to you as-is, most of the time the maintainers have valid reasons to block or not block a specific domain, and if it's a mistake it's better fixed upstream anyway.

*Note: if this is about the NextDNS Recommended Ads & Trackers Blocklist, then please create an issue on this repository.*

## Report a missing domain (a domain that should be blocked but isn't)
Same as above.

## Suggest the addition of a new service
Create an issue (or even better, a PR) on this repository.

## Add (or remove) a domain blocked by a service
Create an issue (or PR) on this repository. If a domain needs to be added, please detail the steps you made to get this domain queried.

## Report a NextDNS bug not directly related the data contained in this reposity
Talk to us via the chat available on https://nextdns.io so we can figure it out and fix it.

## Request a feature or suggest UX/UI improvements
We highly recommend creating a post on our subreddit [/r/nextdns](https://www.reddit.com/r/nextdns) to get more visibility (and so that other less tech-savvy users can join the discussion as well).
