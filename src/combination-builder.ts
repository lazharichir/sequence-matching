import { Logger, Pattern } from "."

export class Combinations<T> {
	public combinations: number[][][] = []
	public count = 0
	public maxWidth = 0
	public maxHeight = 0
	public paths: number[][] = []

	public constructor(private pattern: Pattern<T>, private logger: Logger) {}

	public async build(): Promise<void> {
		const hrstart = process.hrtime()

		for (const condition of this.pattern) {
			const { min, max } = condition
			const parts = []
			for (let index = max; index >= min; index--) {
				const element = Array(index).fill(true)
				parts.push(element)
			}
			this.combinations.push(parts)

			this.count = this.combinations.reduce((acc, cur) => acc * cur.length, 1)
			this.maxWidth = Math.max(...this.combinations.map((c) => c.length))
			this.maxHeight = this.combinations.length
		}

		const hrend = process.hrtime(hrstart)
		this.logger.debug(`⏱️  combination build time:`, `${hrend[0]}s`, `${hrend[1] / 1000000}ms`)
		this.logger.debug(`🔢 # combinations:`, this.combinations.length)
		this.logger.debug(`🔢 # maxWidth:`, this.maxWidth)
		this.logger.debug(`🔢 # maxHeight:`, this.maxHeight)
		this.generatePaths()
	}

	private generatePaths() {
		const hrstart = process.hrtime()
		const reduced: number[][] = []
		const comboLen = this.combinations.length

		for (let a = 0; a < comboLen; a++) {
			const cur = this.combinations[a]
			const arr = []
			const len = cur.length
			for (let x = 0; x < len; x++) {
				arr.push(x)
			}
			reduced.push(arr)
		}

		this.paths = this.cartesian(reduced)

		const hrend = process.hrtime(hrstart)
		this.logger.debug(`⏱️  generate paths time:`, `${hrend[0]}s`, `${hrend[1] / 1000000}ms`)
		this.logger.debug(`🔢 # paths:`, this.paths.length)
		// this.logger.debug(this.paths)
	}

	private cartesian(args: number[][]): number[][] {
		const cartesianHelper = (arr: number[], i: number) => {
			for (let j = 0, l = args[i].length; j < l; j++) {
				const a = arr.slice(0) // clone arr
				a.push(args[i][j])
				if (i == max) r.push(a)
				else cartesianHelper(a, i + 1)
			}
		}

		const max = args.length - 1
		const r: number[][] = []

		cartesianHelper([], 0)

		return r
	}
}
