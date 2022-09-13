import { parse } from "std/flags";
import { getLogger } from "log";
import { Application, Middleware, Context } from "oak"
import { onRequest } from "./middleware.ts";
import errorHandler from "../../../middleware/error-handler.ts";
import checkContentType from "../../../middleware/check-content-type.ts";
import checkCredentials from "../../../middleware/check-credentials.ts";
import staticFiles from "../../../middleware/static-files.ts";
import router from "../../../routes.ts";
import mockDb from "./mock-db.ts";

const logger = getLogger()

const port = serve.port = parse(Deno.args)['port'] ?? 8080;


let promise: Promise<void> | undefined

export default function serve() {
    if (promise) return promise;
    mockDb()
    const app = new Application()

    app.use(onRequest)
    app.use(errorHandler)
    app.use(setHeaders)
    app.use(checkContentType)
    app.use(checkCredentials)
    app.use(staticFiles)
    app.use(router.routes() as Middleware)
    app.use(router.allowedMethods() as Middleware)

    return promise = new Promise<void>((resolve, reject) => {
        app.addEventListener('listen', ({ port }) => {
            logger.info(`MOCK APU listening on port: ${port}`)
            resolve()
        })
        app.listen({ port })
            .catch(logger.error)
            .finally(() => {
                reject()
                logger.info('Mock server stopped')
                promise = undefined
            })
    })
}

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