import { Pattern, SequenceMatcher } from "../src"
import { isNull, isNumber, isOne, isString, isZero } from "./fixtures/predicates"

const cases: Array<[
	any[],
	Pattern<any>,
	number[][],
]> = [
	[
		[],
		[
			{ predicate: isNumber, min: 0, max: 1 },
		],
		[],
	],
	[
		[ null, null, null, null ],
		[
			{ predicate: isNumber, min: 0, max: 1 },
		],
		[],
	],
	[
		[ null, null, null, null ],
		[
			{ predicate: isNumber, min: 0, max: 1 },
			{ predicate: isNumber, min: 0, max: 1 },
		],
		[],
	],
	[
		[ null, null, 1, null ],
		[
			{ predicate: isNull, min: 0, max: 1 },
			{ predicate: isNumber, min: 0, max: 1 },
		],
		[
			[0],
			[1, 2],
			[3],
		],
	],
	[
		[ 0, 1 ],
		[
			{ predicate: isZero, min: 0, max: 1 },
			{ predicate: isNull, min: 0, max: 3 },
			{ predicate: isString, min: 0, max: 3 },
			{ predicate: isNull, min: 0, max: 3 },
			{ predicate: isOne, min: 0, max: 1 },
		],
		[
			[0, 1],
		],
	],
	[
		[ null, 0, 1 ],
		[
			{ predicate: isZero, min: 1, max: 1 },
			{ predicate: isOne, min: 0, max: 1 },
			{ predicate: isOne, min: 1, max: 1 },
		],
		[
			[1, 2],
		],
	],
]

test.each(cases)('#%# %s', async (items, pattern, expected) => {
	const matcher = new SequenceMatcher<any>(items, pattern, { discardEmbeddedRanges: true })
	await matcher.evaluate()
	expect(matcher.matches).toStrictEqual(expected);
}, 1000)