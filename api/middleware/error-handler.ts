import { Context, Status } from 'oak'
import { ApiError, InternalServerError } from "../modules/errors.ts";
import getLogger from "../logger.ts";

const logger = getLogger()

/**
 * Make sure all unhandled errors return a JSONAPI response
 * 
 * Errors of type {@link ApiError} will define their own responses
 */
export default async function errorHandler(context: Context, next: () => Promise<unknown>) {
    try {
        const {method} = context.request;
        const {pathname} = context.request.url;
        logger.info(`${method} ${pathname}`);
        await next();
    } catch (err) {
        logger.info('error-handler:', err.name, err.message ?? err)
        context.response.type = 'application/vnd.api+json'
        if (err instanceof ApiError) {
            context.response.status = err.statusCode
            context.response.body = err.toResponse()
            return;
        } else {
            context.response.status = Status.InternalServerError
            context.response.body = InternalServerError.of(err).toResponse()
        }
    }
}
