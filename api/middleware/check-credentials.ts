
import { Context } from 'oak'
import { AuthorisationError } from "../modules/errors.ts";
import { API_ROOT, INSECURE_ENDPOINTS } from "../modules/rest/api-config.ts";
import { login } from "../modules/service/user-service.ts";
import { extractCredentials } from "../modules/util.ts";
import getLogger from "../logger.ts";

const logger = getLogger()

export default async function checkCredentials(context: Context, next: () => Promise<unknown>) {
	logger.info('middleware: checkCredentials')
	const { method, url } = context.request
	const { pathname } = url

	if (isInsecureEndpoint(pathname, method)) {
		logger.debug(`${method}: ${pathname} >> Authentication not required`)
		await next()
		return // we don't want to continue this script on unwind
	}

	logger.debug(`${method}: ${pathname} >> Authentication Required`)

	await validateCredentials(context.request.headers.get('Authorization'))

	await next()
}

function isInsecureEndpoint(path: string, method: string) {
	// If not an API call content-type not important
	if (!path.includes(API_ROOT)) return true;
	// Test against configured API rules
	return INSECURE_ENDPOINTS.some(test => test(path, method));
}

async function validateCredentials(token: string | null) {
	let username: string | undefined
	try {
		const credentials = extractCredentials(token)
		username = credentials.username
		await login(credentials)
		logger.info('Authenticated user:', username)
	} catch (err) {
		if (err instanceof AuthorisationError) throw err
		logger.error(err)
		throw new AuthorisationError(`${username ?? 'Unknown User'} could not be authenticated`, [err])
	}
}

