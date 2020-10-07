# sequence-matching

A library to help you pattern match sequences of an array of elements against a pattern. Optionally, you can keep or remove the embedded matches.

## When is this useful?

Let's say you have an array of token to represent a sentence in a natural language document. Each token is a word or punctuation and it is accompanied with its part of speech tag (e.g. is it a noun or adjective or else).

```typescript
const items = [
	{ i: 0, text: `I`, tag: `N/A` },
	{ i: 1, text: `prefer`, tag: `VERB` },
	{ i: 2, text: `small`, tag: `ADJ` },
	{ i: 3, text: `fluffy`, tag: `ADJ` },
	{ i: 4, text: `dogs`, tag: `NOUN` },
	{ i: 5, text: `,`, tag: `PUNCT` },
	{ i: 6, text: `and`, tag: `N/A` },
	{ i: 7, text: `cats`, tag: `NOUN` },
	{ i: 8, text: `too`, tag: `N/A` },
]
```

Now, our pattern will be such as we want:
- zero to three adjective(s)
- followed by one noun to three nouns

```typescript
const pattern = [
	{ predicate: (token) => token.tag === `ADJ`, min: 0, max: 3 },
	{ predicate: (token) => token.tag === `NOUN`, min: 1, max: 5 },
]
```

Which should give us the two matches:
```typescript
const matcher = new SequenceMatcher(items, pattern)
await matcher.evaluate()
expect(matcher.matches).toStrictEqual([
	[2, 3, 4],
	[7],
])
```

## What for?

In simple terms:
- you have an array of elements (any type, even scalars)
- you have a pattern as an array of conditions in which each condition is:
  - `predicate` – a boolean function to check each element against
  - `min` – how many elements should match this condition at least (inclusive) 
  - `max` – how many elements should match this condition at most (inclusive)

And, in that array, you want to find sequences of n elements that match the pattern you want.

## Workflow

Such library is full of edge cases so a regular loop was did not work.

Instead, we follow these steps:
1. Build a predicate matrix
   - test each element against each predicate and save that result in a matrix for lookups later
2. Compute all possible combinations (see `combination-builder.ts`)
   - each condition has a varying length based on its `min` and `max`
   - each match has a length between the pattern's minimum and maximum
   - based on that we compute every single combination possible
3. Walk each combination and find matches
4. Discard embedded matches (e.g. `[5, 6]` is embedded in `[5, 6, 7]`)
5. Sort the matches

## Performances

The longest step in the above workflow is the walk (#3). Performances will vary based on how mnay items are in the array, and how many possible combinations there are. To improve speed, avoid "wide" conditions with a min and max far away from each other.

Initially, I built this using `reduce`, `map`, `filter`, `forof`, `forin`, `Array(n).fill(x).map()` in various places but the execution time was too high. Therefore, there are many `for` loops and they do shave off important milliseconds but we lose in readability.

## Help

Please raise a PR if you think of an edge case and managed to fix it. 