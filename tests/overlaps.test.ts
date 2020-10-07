import { SequenceMatcher } from "../src"
import { isNumber, isString } from "./fixtures/predicates"

test(`without embeds`, async () => {
	
	const items: any[] = [
		45,
		`a`,
		`b`,
		`c`,
		`d`,
		`e`,
		new Array(),
		1,
		19,
		234,
		`wow.`,
		`NO NO.`,
		null,
	]

	const matcher = new SequenceMatcher(items, [
		{ predicate: isNumber, min: 1, max: 1 },
		{ predicate: isString, min: 1, max: 4 },
	], { discardEmbeddedRanges: true })

	await matcher.evaluate()

	expect(matcher.matches).toStrictEqual([
		[0,1,2,3,4],
		[9,10,11],
	])

})

test(`with embeds`, async () => {
	
	const items: any[] = [
		45,
		`a`,
		`b`,
		`c`,
		`d`,
		`e`,
		new Array(),
		1,
		19,
		234,
		`wow.`,
		`NO NO.`,
		null,
	]

	const matcher = new SequenceMatcher(items, [
		{ predicate: isNumber, min: 1, max: 1 },
		{ predicate: isString, min: 1, max: 4 },
	], { discardEmbeddedRanges: false })

	await matcher.evaluate()

	expect(matcher.matches).toStrictEqual([
		[0,1],
		[0,1,2],
		[0,1,2,3],
		[0,1,2,3,4],
		[9,10],
		[9,10,11],
	])

})
