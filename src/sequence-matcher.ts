import { Combinations } from "./combination-builder"
import { NoOpLogger } from "./helpers"
import { ISequenceMatcher, Logger, Match, Pattern, SequenceMatcherOptions } from "./types"

export class SequenceMatcher<T> implements ISequenceMatcher {
	public matches: Readonly<Match[]> = []
	private matrix: boolean[][] = []
	private combinations: Combinations<T>

	public constructor(
		private items: T[],
		private pattern: Pattern<T>,
		private options: SequenceMatcherOptions = { discardEmbeddedRanges: true, debug: false },
		private logger: Logger = console
	) {
		if (!this.options.debug) this.logger = NoOpLogger

		this.validatePattern()
		this.combinations = new Combinations(this.pattern, this.logger)
		this.logger.debug(`🔢 # items:`, this.items.length)
		this.logger.debug(`🔢 # conditions:`, this.pattern.length)
	}

	public async evaluate(): Promise<void> {
		const hrstart = process.hrtime()
		await this.combinations.build()
		await this.buildPredicateMatrix()
		await this.walk()
		await this.discardEmbeddedRanges()
		await this.sort()
		const hrend = process.hrtime(hrstart)
		this.logger.debug(`⏱️  evaluate time:`, `${hrend[0]}s`, `${hrend[1] / 1000000}ms`)
		this.logger.debug(`ℹ️  # matches:`, this.matches.length)
	}

	private async walk(): Promise<void> {
		const hrstart = process.hrtime()
		const matches = []

		const itemsLen = this.items.length
		const combinationsPathsLen = this.combinations.paths.length

		loop1: for (let pathIndex = 0; pathIndex < combinationsPathsLen; pathIndex++) {
			const path = this.combinations.paths[pathIndex]
			const mapped = path.map((col, row) => this.combinations.combinations[row][col])
			const len = mapped.flat().length

			loop2: for (let itemIndex = 0; itemIndex < itemsLen; itemIndex++) {
				if (len > itemsLen - itemIndex) continue loop2

				const window = []
				for (let a = 0; a < len; a++) {
					window.push(itemIndex + a)
				}

				const mappedWindow = this.unflat(window, mapped)

				loop3: for (let ci = 0; ci < mappedWindow.length; ci++) {
					const slice = mappedWindow[ci]

					loop4: for (let zz = 0; zz < slice.length; zz++) {
						const ii = slice[zz]

						if (this.lookup(ii, ci) === false) continue loop2
					}
				}

				const flattenedMatch = mappedWindow.flat()
				if (flattenedMatch.length > 0) matches.push(flattenedMatch)
			}
		}

		this.matches = matches

		const hrend = process.hrtime(hrstart)
		this.logger.debug(`⏱️  walk time:`, `${hrend[0]}s`, `${hrend[1] / 1000000}ms`)
	}

	private sort(): void {
		const hrstart = process.hrtime()
		const sortedMatches = this.matches.slice().sort()
		this.matches = sortedMatches
		const hrend = process.hrtime(hrstart)
		this.logger.debug(`⏱️  sort:`, `${hrend[0]}s`, `${hrend[1] / 1000000}ms`)
	}

	private async buildPredicateMatrix(): Promise<void> {
		const hrstart = process.hrtime()

		const matrix = []

		let i = 0
		for (const item of this.items) {
			const row = await this.pattern.reduce<Promise<boolean[]>>(async (acc, condition) => {
				const outcome = await condition.predicate(item, i, this.items)
				;(await acc).push(outcome)
				return acc
			}, Promise.resolve([]))

			matrix.push(row)
			i++
		}

		this.matrix = matrix

		const hrend = process.hrtime(hrstart)
		this.logger.debug(
			`⏱️  build predicate matrix time:`,
			`${hrend[0]}s`,
			`${hrend[1] / 1000000}ms`
		)
	}

	private isAEmbeddedInB(a: number[], b: number[]): boolean {
		return a.length < b.length && a[0] >= b[0] && a[a.length - 1] <= b[b.length - 1]
	}

	private discardEmbeddedRanges(): void {
		if (!this.options.discardEmbeddedRanges) {
			this.logger.debug(`⏱️  discardEmbeddedRanges$: SKIPPED`)
			return
		}

		const hrstart = process.hrtime()

		const len = this.matches.length
		const isEmbeddedLookup: { [k: number]: boolean } = {}

		const clean: number[][] = []

		loopA: for (let i = 0; i < len; i++) {
			const a = this.matches[i]

			loopB: for (let j = 0; j < len; j++) {
				if (i === j) continue loopB

				const embedded = this.isAEmbeddedInB(a, this.matches[j])

				if (embedded) {
					isEmbeddedLookup[i] = true
					continue loopA
				}
			}

			clean.push(a)
		}

		this.matches = clean

		const hrend = process.hrtime(hrstart)
		this.logger.debug(`⏱️  discardEmbeddedRanges:`, `${hrend[0]}s`, `${hrend[1] / 1000000}ms`)
	}

	private unflat(path: number[], mapped: number[][] = []) {
		let i = -1
		const data = mapped.map((x) => {
			const arr = []
			for (let y = 0; y < x.length; y++) {
				i++
				arr.push(path[i])
			}
			return arr
		})
		return data
	}

	private lookup(item: number, condition: number): boolean {
		if (this.matrix[item] === undefined) throw new RangeError(`No item at index ${item}`)
		if (this.matrix[item][condition] === undefined)
			throw new RangeError(`No condition at index ${condition}`)
		return Boolean(this.matrix[item][condition])
	}

	private validatePattern() {
		if (this.pattern.length === 0)
			throw new Error(`A pattern cannot be empty (it needs at least one condition)`)
		let i = -1
		for (const condition of this.pattern) {
			i++
			const { min, max } = condition
			if (!Number.isFinite(min))
				throw new Error(`A finite "min" number is required [condition: ${i}]`)
			if (!Number.isFinite(max))
				throw new Error(`A finite "max" number is required [condition: ${i}]`)
			if (min > max)
				throw new Error(
					`The "min" value must be lesser then the "max" value [condition: ${i}]`
				)
		}
	}
}
