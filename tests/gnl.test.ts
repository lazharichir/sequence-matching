import { SequenceMatcher } from "../src"
import data from "./data/google-nl-api-response.json"

type Token = {
	text: {
		content: string
	}
	partOfSpeech: {
		tag: `NOUN` | `ADP` | `ADV` | `ADJ` | `DET` | `VERB`
	}
}

const items = data.tokens as Token[]

const pattern = [
	{ predicate: (input: Token) => input.partOfSpeech.tag === `VERB`, min: 1, max: 2 },
	{ predicate: (input: Token) => input.partOfSpeech.tag === `ADJ` || input.partOfSpeech.tag === `NOUN`, min: 1, max: 3 },
	{ predicate: (input: Token) => input.partOfSpeech.tag === `NOUN`, min: 1, max: 4 },
]

test(`with overlaps`, async () => {
	const matcher = new SequenceMatcher(items, pattern, { discardEmbeddedRanges: false })
	await matcher.evaluate()
	expect(matcher.matches.length).toBeGreaterThan(0)
})

test(`without overlaps`, async () => {
	const matcher = new SequenceMatcher(items, pattern, { discardEmbeddedRanges: true })
	await matcher.evaluate()
	expect(matcher.matches.length).toBeGreaterThan(0)
})
