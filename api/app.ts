
/* app.ts */

import { Application, Middleware } from 'oak'
import type { Context } from 'oak'

import router from './routes.ts'
import checkContentType from "./middleware/check-content-type.ts";
import errorHandler from "./middleware/error-handler.ts";
import checkCredentials from "./middleware/check-credentials.ts";
import staticFiles from "./middleware/static-files.ts";
import getLogger from "./logger.ts";

const logger = getLogger()

const app = new Application()

function setHeaders(context: Context, next: () => Promise<unknown>) {
	logger.info('setHeaders')
	// context.response.headers.set('content-type', 'application/vnd.api+json')
	context.response.headers.set('charset', 'utf-8')
	context.response.headers.set('Access-Control-Allow-Origin', '*')
	context.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	context.response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
	context.response.headers.set('Access-Control-Allow-Credentials', 'true')
	return next()
}

app.use(errorHandler)
app.use(setHeaders)
app.use(checkContentType)
app.use(checkCredentials)
app.use(staticFiles)
app.use(router.routes() as Middleware)
app.use(router.allowedMethods() as Middleware)

export default app