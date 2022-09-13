
/* util.js */

/* FUNCTIONS USED IN FORMS */

export function file2DataURI(file: Blob): Promise<string> {
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result as string)
		}
		reader.readAsDataURL(file)
	})
}

export function getQueryString(search: Record<string, string | string[]> | undefined) {
	if (!search || search === {}) return ''
	const searchParams = new URLSearchParams()
	for (const [key, value] of Object.entries(search)) {
		if (typeof value === 'string') {
			searchParams.set(key, encodeURIComponent(value))
		} else if (value instanceof Array) {
			value.forEach(v => searchParams.append(key, encodeURIComponent(v)))
		}
	}
	const queryString = searchParams.toString()
	return queryString ? `?${queryString}` : ''
}

/* USEFUL HELPER FUNCTIONS */

export function isNil(o: unknown) {
	return o === null || o == undefined
}

export function assertNotNil<T>(o: T | undefined | null): asserts o is T {
	if (isNil(o)) throw Error('Value is nil')
}

export function nonNil<T>(o: T | undefined | null): T {
	assertNotNil(o)
	return o
}