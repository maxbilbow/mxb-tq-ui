import FaqNotification from '../elements/faq-notification.js'
import { nonNil } from '../util.js'
import getLogger from './logger.js'

interface NotifactationOptions {
    autoDismissDelay?: number,
    severity?: 'error' | 'warn' | 'info' | 'success'
}

const logger = getLogger()

/**
 * Provides a simple UI Notification API
 */
export default class Notifications {
    static setApiOffline(offline: boolean) {
        if (offline) {
            logger.debug('Api is offline')
            document.getElementById('faq-api-offline-message')?.classList.remove('hidden')
        } else {
            logger.debug('Api is online')
            document.getElementById('faq-api-offline-message')?.classList.add('hidden')
        }
    }

    static notify(message: string, { autoDismissDelay = 5000, severity = 'info' }: NotifactationOptions = {}) {
        logger.debug('UI Notification:', message)
        const footer = nonNil<HTMLElement>(document.querySelector('footer'))
        footer.appendChild(new FaqNotification({ message, delay: autoDismissDelay, severity }))
    }
    static error(message: string, options?: NotifactationOptions) {
        return Notifications.notify(message, { ...options, severity: 'error' })
    }

    static warn(message: string, options?: NotifactationOptions) {
        return Notifications.notify(message, { ...options, severity: 'warn' })
    }
    static success(message: string, options?: NotifactationOptions) {
        return Notifications.notify(message, { ...options, severity: 'success' })
    }
}
