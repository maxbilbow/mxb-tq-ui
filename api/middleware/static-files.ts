import { Context, send } from 'oak'
import { fileExists, getEtag } from "../modules/util.ts";
import getLogger from "../logger.ts";

const logger = getLogger()

const secretPaths = [
	'package.json', 'package-lock.json',
	'tsconfig.json', 'build-tools'
]

function isProtected(pathname: string) {
	if (secretPaths.some(p => pathname.includes(p))) return true
	return pathname.split('/').some(part => part.startsWith('.'))
}

/**
 * Serve all but protected static files
 */
export default async function staticFiles(context: Context, next: () => Promise<unknown>) {
	const { url } = context.request
	const { pathname } = url
	if (isProtected(pathname)) {
		return await next()
	}
	const path = `${Deno.cwd()}/spa${pathname}`
	const isFile = await fileExists(path)

	if (!isFile) {
		return await next()
	}

	// file exists therefore we can serve it
	logger.info(path)
	const etag = await getEtag(path)
	logger.info(`etag: ${etag}`)
	context.response.headers.set('ETag', etag)
	await send(context, context.request.url.pathname, {
		root: `${Deno.cwd()}/spa`,
	})

}