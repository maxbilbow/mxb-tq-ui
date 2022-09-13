import getLogger from './logger.js'
import { isRoot, loadRoute } from './router.js'

interface RouteOptions {
    preventLoad?: boolean
}

const logger = getLogger()

const stack = ['/']

const listeners: ((ev?: PopStateEvent) => void)[] = []

window.addEventListener('popstate', triggerPageChange)

window.addEventListener('load', () => triggerPageChange())

/**
 * Centralised navigation API for route management
 */
export default class AppNavigator {
    static load(route: string) {
        location.href = route
    }

    static onStateChange(listener: (ev?: PopStateEvent) => void | Promise<void>) {
        listeners.push(listener)
        return () => {
            const index = listeners.indexOf(listener)
            listeners.splice(index, index)
        }
    }

    static canGoBack() {
        return !isRoot(this.getPageName())
    }

    static pop() {
        if (stack.length > 1) {
            logger.debug('POP: Using browser history to go back')
            history.back()
            stack.pop()
        } else {
            logger.debug('POP: Going back to home page')
            this.replace('/')
        }
    }

    static replace(route: string, { preventLoad }: RouteOptions = {}) {
        if (formatRoute(this.getPageName()) === route) {
            logger.warn('Already at route', route, '. Will not replace')
        }
        logger.debug('Replacing current route:', route)
        stack[stack.length - 1] = route
        history.replaceState(null, '', formatRoute(route))
        if (!preventLoad) {
            return triggerPageChange().catch(logger.error)
        }
    }

    static push(route: string, { preventLoad }: RouteOptions = {}) {
        logger.debug('Pushing route onto stack:', route)
        stack.push(route)
        history.pushState(null, '', formatRoute(route))
        if (!preventLoad) {
            return triggerPageChange().catch(logger.error)
        }
    }

    static getPageName() {
        logger.debug('getPageName(): current pathname -', window.location.pathname)
        const page = window.location.pathname.substring(1)
        // const page = path || 'question-list'
        logger.debug('getPageName():', page)
        return page
    }

    static reload() {
        logger.debug('Reloading current view')
        return triggerPageChange().catch(logger.error)
    }
}

function notifyListeners(ev?: PopStateEvent) {
    return Promise.all(listeners.map(async callback => {
        try {
            await callback(ev)
        } catch (e) {
            logger.error(e)
        }
    }))
}

async function triggerPageChange(ev?: PopStateEvent) {
    logger.debug('pageChange')
    const page = AppNavigator.getPageName()
    logger.debug(`trying to load page: ${page}`)
    // get a reference to the correct template element
    if (await loadRoute(page)) {
        return notifyListeners(ev)
    }
}

function formatRoute(route = '/') {
    if (!route.startsWith('/')) {
        return `/${route}`
    }
    return route
}