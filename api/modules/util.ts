
/* util.js */

import { Md5 } from 'std/hash/md5'
import { AuthorisationError } from "./errors.ts";
import getLogger from '../logger.ts';

const logger = getLogger()

const AUTH_TYPE = 'Basic'
const MSG_SUFFIX = '. The API uses HTTP Basic Auth and requires a correctly-formatted Authorization header'
export const MSG_MISSING_TOKEN = `Missing token${MSG_SUFFIX}`
export const MSG_WRONG_AUTH_TYPE = `Wrong auth type - expected ${AUTH_TYPE}${MSG_SUFFIX}`
export const MSG_INVALID_TOKEN = `Invalid token${MSG_SUFFIX}`
export function extractCredentials(token: string | null | undefined) {
	logger.info('checkAuth')
	if (!token) throw new AuthorisationError(MSG_MISSING_TOKEN)

	try {
		const [username, password] = parseToken(token)
		logger.debug('User:', username)
		return { username: username?.toLowerCase(), password }
	} catch (e) {
		if (e instanceof AuthorisationError) throw e
		throw new AuthorisationError(MSG_INVALID_TOKEN, e)
	}

}

function parseToken(token: string) {
	const [type, hash] = token.split(' ')
	logger.info(`${type} : ${hash}`)

	if (type !== AUTH_TYPE) throw new AuthorisationError(MSG_WRONG_AUTH_TYPE)

	const str = atob(hash)

	if (str.indexOf(':') === -1) throw new AuthorisationError(MSG_INVALID_TOKEN)

	return str.split(':')

}
// checks if file exists
export async function fileExists(path: string) {
	try {
		const stats = await Deno.lstat(path)
		return stats && stats.isFile
	} catch (e) {
		if (e && e instanceof Deno.errors.NotFound) {
			return false
		} else {
			throw e
		}
	}
}

export async function getEtag(path: string) {
	const stat = await Deno.stat(path)
	const mtime = stat.mtime
	const timestamp = Date.parse(mtime?.toISOString()!)
	const size = stat.size
	const uid = (`${path}:${timestamp}:${size}`)
	const md5 = new Md5()
	const etag = md5.update(uid).toString()
	return etag
}