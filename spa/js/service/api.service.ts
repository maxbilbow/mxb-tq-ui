import type { Error as JSONAPIError, JSONAPISchema } from '../../generated/json-api'
import { API_ROOT } from '../config.js'
import * as AppState from '../framework/app-state.js'
import getLogger from '../framework/logger.js'
import Notifications from '../framework/notifications.js'
import { getQueryString } from '../util.js'

interface Options {
    secure: boolean,
    search?: Record<string, string | string[]>,
    autoRetry?: {
        timeout: number,
        times: number
    }
}

export class ApiError extends Error {
    constructor(readonly errors: JSONAPIError[]) {
        super(errors?.[0]?.detail ?? '')
    }
}
const logger = getLogger()

/**
 * Fetch API Wrapper for API requests
 */
export default class Api {
    static async get<T extends JSONAPISchema>(path: string, { search, secure, autoRetry = { timeout: 500, times: 3 } }: Options = { secure: false }): Promise<T> {
        const response = await fetch(`${API_ROOT}${path}${getQueryString(search)}`, {
            headers: getHeaders(secure)
        })
        if (!response.ok && autoRetry.times > 0 && autoRetry.timeout > 0) {
            await new Promise(resolve => setTimeout(resolve, autoRetry.timeout))
            logger.debug(`retrying requst ${autoRetry.times} more times`)
            const opts = { secure, search, autoRetry: { ...autoRetry, times: autoRetry.times - 1 } }
            return this.get(path, opts)
        }
        return handleResponse(response)
    }

    static async post<T extends JSONAPISchema>(path: string, body: JSONAPISchema, { secure }: Options = { secure: false }): Promise<T> {
        const response = await fetch(`${API_ROOT}${path}`, {
            method: 'POST',
            headers: getHeaders(secure),
            body: JSON.stringify(body)
        })
        return handleResponse(response)
    }

    static async put<T extends JSONAPISchema>(path: string, body: JSONAPISchema, { secure }: Options = { secure: false }): Promise<T> {
        const response = await fetch(`${API_ROOT}${path}`, {
            method: 'PUT',
            headers: getHeaders(secure),
            body: JSON.stringify(body)
        })
        return handleResponse(response)
    }

    static async patch<T extends JSONAPISchema>(path: string, body: JSONAPISchema, { secure }: Options = { secure: false }): Promise<T> {
        const response = await fetch(`${API_ROOT}${path}`, {
            method: 'PATCH',
            headers: getHeaders(secure),
            body: JSON.stringify(body)
        })
        return handleResponse(response)
    }

    static async delete<T extends JSONAPISchema>(path: string, { secure }: Options = { secure: false }): Promise<T> {
        const response = await fetch(`${API_ROOT}${path}`, {
            method: 'DELETE',
            headers: getHeaders(secure)
        })
        return handleResponse(response)
    }
}

function getHeaders(secure: boolean) {
    const headers: HeadersInit = {
        'content-type': 'application/vnd.api+json'
    }
    if (secure) {
        const token = AppState.get<string>('authorization') ?? ''
        headers.authorization = token
    }
    return headers
}

async function handleResponse<T extends JSONAPISchema>(response: Response): Promise<T> {
    const apiResponse = await response.json() as JSONAPISchema
    const isApiOffline = response.headers.has('X-Cached-Response') || response.headers.has('X-Mock-Response')

    Notifications.setApiOffline(isApiOffline)

    if (response.ok) return apiResponse as T

    logger.warn('API Bad Response', response.status)

    if (!('errors' in apiResponse)) {
        logger.info('Cached response served')
        return apiResponse as T
    }

    logger.debug(apiResponse.errors)
    throw Error(`${response.statusText} - ${apiResponse.errors[0]?.detail}`)
}