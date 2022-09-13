import { Context } from "oak";
import { UnsupportedMediaTypeError } from "../modules/errors.ts";
import { validateJsonApi } from "../modules/rest/json-api-validator.ts";
import getLogger from "../logger.ts";

const logger = getLogger()

export const JSON_API_ERROR_MESSAGE = 'This API supports the JSON:API specification, Content-Type must be application/vnd.api+json'
export default async function checkContentType(context: Context, next: () => Promise<unknown>) {
    logger.info('middleware: checkContentType')

    const path = context.request.url.pathname
    const contentType = context.request.headers.get('content-type')
    const method = context.request.method;
    // if not an API call content-type not important
    if (!path.includes('/api/')) {
        await next()
        return // we don't want to continue this script on unwind
    }
    if (!context.request.hasBody || method === 'DELETE') {
        await next();
        return; // Requests with no body have no content type.
    }
    if (contentType !== 'application/vnd.api+json') {
        logger.info('wrong Content-Type')
        throw new UnsupportedMediaTypeError(JSON_API_ERROR_MESSAGE)
    }

    const body = context.request.body({ type: 'json' })
    const data = await body.value
    validateJsonApi(typeof data === 'string' ? JSON.parse(data) : data)

    await next()
    return
}