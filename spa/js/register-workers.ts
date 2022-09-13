import AppNavigator from './framework/app-navigator.js'
import getLogger from './framework/logger.js'

const logger = getLogger()

export default async function registerWorkers() {
    if (!('serviceWorker' in navigator)) {
        return logger.warn('Service Workers not supported')
    }

    let registration: ServiceWorkerRegistration
    try {
        registration = await navigator.serviceWorker.register('/service-worker.js', { type: 'module' })
        logger.info('Registration successful, scope is:', registration.scope)
        addListeners(registration)
        initAutoUpdate()
    } catch (error) {
        return logger.error('Service worker registration failed, error:', error)
    }

}

function addListeners(registration: ServiceWorkerRegistration) {
    registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing
        if (!installingWorker) return
        logger.info('A new service worker is being installed', installingWorker)

        installingWorker.onstatechange = ev => {
            logger.info('Worker state change:', ev)
        }
    })
}

/**
 * A service worker will udpdate ever 24 hours if a page is loaded
 * 
 * SPAs may not trigger this event so we must counter for this possibility
 */
function initAutoUpdate() {
    const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000
    let lastUpdateTime = Date.now()
    AppNavigator.onStateChange(async () => {
        if (Date.now() - lastUpdateTime < ONE_DAY_MILLIS) return
        try {
            const registration = await navigator.serviceWorker.ready
            logger.info('Updating service worker')
            await registration.update()
            logger.info('Update complete')
            lastUpdateTime = Date.now()
        } catch (e) {
            logger.error('Failed to update service worker', e)
        }
    })
    logger.debug('Monitoring route chanes')
}
