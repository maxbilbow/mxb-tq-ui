import type { Failure } from '../generated/json-api'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - Required to declare correct type for self
declare const self: ServiceWorkerGlobalScope & typeof globalThis

// Adapted from various examples on https://googlechrome.github.io/samples/

// Cache version will require updating whenever static assets change 
// This forces the service worker to update (when checked) and clears outdated existing caches
const CACHE_VERSION = '2.10'
const CURRENT_CACHES = {
    prefetch: 'prefetch-cache-v' + CACHE_VERSION,
    runtime: 'runtime-cache-v' + CACHE_VERSION,
    offline: 'offline-cache-v' + CACHE_VERSION
}

/// Serve index.html if route fails 
const OFFLINE_URL = 'index.html'

/// Allow cross-origin caching (although this is not usually recommended)
const ALLOWED_ORIGINS = [] as string[]

// Static assets that should never be cached
const NO_CACHE = ['service-worker.js', 'precache.json']

// Prefix all logs to help with debugging
const LOG_NAME = 'SW:'

// Custom logger
const logger: Pick<Console, 'info' | 'warn' | 'error' | 'debug'> = {
    // eslint-disable-next-line no-console
    info: (...args) => console.info(LOG_NAME, ...args),
    // eslint-disable-next-line no-console
    warn: (...args) => console.warn(LOG_NAME, ...args),
    // eslint-disable-next-line no-console
    error: (...args) => console.error(LOG_NAME, ...args),
    // eslint-disable-next-line no-console
    debug: (...args) => console.debug(LOG_NAME, ...args)
}


self.addEventListener('error', function (e) {
    logger.error(e.filename, e.lineno, e.colno, e.message)
})

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', (event) => {
    const now = Date.now()

    // A list of local resources we always want to be cached.

    // https://googlechrome.github.io/samples/service-worker/custom-offline-page/index.html
    event.waitUntil((async () => {
        try {
            const cache = await caches.open(CURRENT_CACHES.offline)
            // Setting {cache: 'reload'} in the new request will ensure that the response
            // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
            await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }))
            logger.debug('offline page cached')
        } catch (e) {
            logger.error('Offline.html caching failed', e)
        }
        try {
            const precache = await fetch('/workers/precache.json')
            if (!precache.ok) {
                throw new Error(`Pre-cache failed: ${precache.statusText}`)
            }
            logger.info('fetching precache file map')

            // List known 'static' routes to be pre-cached
            const urlsToPrefetch = [
                '',
                '/',
                '/index.html',
                '/question-list',
                '/login',
                '/logout',
                '/register',
                // Import full list of static assets for pre-caching
                ...await precache.json()
            ]
            logger.debug('Adding precache.json', urlsToPrefetch)


            const cache = await caches.open(CURRENT_CACHES.prefetch)
            const cachePromises = urlsToPrefetch.map(async (urlToPrefetch) => {
                // This constructs a new URL object using the service worker's script location as the base
                // for relative URLs.
                const url = new URL(urlToPrefetch, location.href)

                // Append a cache-bust=TIMESTAMP URL parameter to each URL's query string to prevent local cache retrieval
                url.search += (url.search ? '&' : '?') + 'cache-bust=' + now

                const request = new Request(url.toString(), { mode: 'no-cors' })
                try {
                    const response = await fetch(request)
                    if (response.status >= 400) {
                        throw new Error('request for ' + urlToPrefetch +
                            ' failed with status ' + response.statusText)
                    }

                    // Use the original URL without the cache-busting parameter as the key for cache.put().
                    return await cache.put(urlToPrefetch, response)
                } catch (error) {
                    logger.error(`Not caching ${urlToPrefetch} due to ${error}`)
                }

            })

            await Promise.all(cachePromises).then(function () {
                logger.info('Pre-fetching complete.')
            })
        } catch (error) {
            logger.error('Pre-fetching failed:', error)
        }
    })())
})

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    // https://googlechrome.github.io/samples/service-worker/custom-offline-page/index.html
    event.waitUntil((async () => {
        // Enable navigation preload if it's supported.
        // See https://developers.google.com/web/updates/2017/02/navigation-preload
        if ('navigationPreload' in self.registration) {
            logger.debug('navigationPreload enable...')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (self.registration as any).navigationPreload.enable()
        }
    })())

    const expectedCacheNames = Object.values(CURRENT_CACHES)
    event.waitUntil(
        caches.keys()
            .then(cacheNames => cacheNames.filter(cacheName => !expectedCacheNames.includes(cacheName)))
            .then(cachesToDelete => {
                logger.info('Deleting old caches')
                return Promise.all(cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete)))
            })
            .then(() => self.clients.claim())
    )
})

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
    const { url, method, mode } = event.request
    const isApi = isApiRequest(url)
    if (!shouldCache(url, method)) return

    event.respondWith((async () => {
        const responsePromise = shouldFetchFirst(url) ? fetchFirst(event) : cacheFirst(event)
        try {
            return await responsePromise
        } catch (e) {
            logger.error(`Failed to retrieve or cache ${url}`, e)
            if (mode === 'navigate') {
                const offlinePage = await getOffline(event)
                if (offlinePage) return offlinePage
            }
            if (isApi) return buildApiErrorResponse(e)
            return new Response('Bugger', { status: 404, statusText: 'Not found or cached' })
        }
    })())
})

async function fetchFirst(event: FetchEvent): Promise<Response> {
    try {
        return await getFromServer(event)
    } catch (e) {
        const cachedResponse = await getFromCache(event)
        if (cachedResponse) return cachedResponse

        if (isApiRequest(event.request.url)) {
            return buildApiErrorResponse(e)
        }

        throw e
    }

}

async function cacheFirst(event: FetchEvent): Promise<Response> {
    return await getFromCache(event) ?? await getFromServer(event)
}

async function getFromServer(event: FetchEvent) {
    logger.debug(`attempting to retrieve from server - ${event.request.url}`)
    const serverResponse = await fetch(event.request)
    try {
        await storeInCache(event.request, serverResponse)
    } catch (e) {
        logger.error(`failed to cache response from ${event.request.url}`, e)
    }
    return serverResponse
}

async function getFromCache(event: FetchEvent) {
    const { url, mode } = event.request
    if (mode === 'navigate' && 'navigationPreload' in self.registration) {
        // First, try to use the navigation preload response if it's supported.
        const preloadResponse = await (<unknown>event as Record<string, unknown>).preloadResponse
        if (preloadResponse) {
            return preloadResponse as Response
        }
    }
    const cachedResponse = await caches.match(event.request)
    if (cachedResponse) {
        logger.debug(`cached response found for ${url}`)
        return processCachedResponse(cachedResponse)
    }
    return undefined
}

async function storeInCache(request: Request, serverResponse: Response) {
    const cache = await caches.open(CURRENT_CACHES.runtime)

    logger.debug('Cache open')

    logger.debug(`Caching response from ${request.url}`)
    // Put a copy of the response in the runtime cache.
    await cache.put(request, serverResponse.clone())
    logger.debug(`Successfully cached ${request.url}`)
    return serverResponse
}

/**
 * The API is expecting a JSONSchema error response. This method ensures one is returned
 */
function buildApiErrorResponse(err?: unknown): Response {
    const errorResponse: Failure = {
        errors: [
            {
                id: '1',
                status: '418',
                title: 'Service Worker Error',
                detail: 'Cached version of resource was not available'
            }
        ],
        meta: {
        }
    }
    if (err) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        errorResponse.meta!.cause = '2'
        errorResponse.errors.push({
            id: '2',
            title: (err as Error).name ?? String(err),
            detail: (err as Error).message ?? String(err)
        })
    }
    return new Response(JSON.stringify(errorResponse), {
        headers: { 'content-type': 'application/vnd.api+json', 'X-Mock-Response': 'yes' },
        status: 418,
        statusText: 'Offline version of resource not available'
    })
}

/**
 * If the cached response is from our API, we need to provide a hit to the client
 * that this data is from a cache
 */
async function processCachedResponse(cachedResponse: Response): Promise<Response> {
    if (!isApiRequest(cachedResponse.url)) return cachedResponse

    const body = await cachedResponse.text()
    const headers: HeadersInit = {
        // Hint to be interpreted by client
        'X-Cached-Response': 'yes'
    }
    cachedResponse.headers.forEach((value, key) => {
        headers[key] = value
    })
    return new Response(body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
    })

}

function shouldCache(url: string, method: string) {
    // Don't cache POST, PUT, DELETE, etc (currently there are no exceptions)
    if (method !== 'GET') return false
    // Don't cache a login response!
    if (isApiRequest(url) && url.includes('/users')) return false
    // Don't cache certain files (e.g. this one!)
    if (NO_CACHE.some(filename => url.includes(filename))) return false
    // Allow same origin
    if (url.startsWith(self.location.origin)) return true
    // Check for allowed cross-origin
    if (ALLOWED_ORIGINS.some((o) => url.startsWith(o))) return true
    return false
}


/**
 * Our api path serves dynamic data so we will want to check the server first
 */
function isApiRequest(url: string) {
    return url.includes('/api/v')
}

/**
 * Is the response likely to change? (and is it important?!)
 * At the moment, this means API requests only
 */
const isDynamic = isApiRequest

/**
 * For dynamic data (i.e. our API), we always prefer server first
 */
function shouldFetchFirst(url: string) {
    return isDynamic(url)
}

/**
 * Attempt to retrieve the requested route else, return our cached index page
 */
async function getOffline(event: FetchEvent) {
    try {
        return await fetch(event.request)
    } catch (error) {
        // catch is only triggered if an exception is thrown, which is likely
        // due to a network error.
        // If fetch() returns a valid HTTP response with a response code in
        // the 4xx or 5xx range, the catch() will NOT be called.
        logger.debug('Fetch failed; returning offline page instead.', error)

        const cache = await caches.open(CURRENT_CACHES.offline)
        const cachedResponse = await cache.match(OFFLINE_URL)
        return cachedResponse
    }
}
