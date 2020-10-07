export type SyncPredicate<T = any> = (input: T, index: number, items: T[]) => boolean
export type AsyncPredicate<T = any> = (input: T, index: number, items: T[]) => Promise<boolean>
export type Predicate<T> = SyncPredicate<T> | AsyncPredicate<T>

export type Condition<T> = {
	min: number
	max: number
	predicate: Predicate<T>
}

export type Pattern<T> = Condition<T>[]

export type Logger = {
	trace(...data: any[]): void
	debug(...data: any[]): void
	info(...data: any[]): void
	warn(...data: any[]): void
	error(...data: any[]): void
}

export type SequenceMatcherOptions = {
	discardEmbeddedRanges?: boolean
	debug?: boolean
}

export type Match = number[]

export type ISequenceMatcher = {
	matches: Readonly<Match[]>
	evaluate(): Promise<void>
}
