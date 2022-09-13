import * as AppState from '../framework/app-state.js'
import AppNavigator from '../framework/app-navigator.js'
import FaqToggle from './faq-toggle.js'
import { nonNil } from '../util.js'
import getLogger from '../framework/logger.js'

const logger = getLogger()

/**
 * Custom navigation bar that auto hides items depending on user's authorisation status
 */
class FaqNavBar extends HTMLElement {
    disconnectedCallback
    constructor() {
        super()
        const unregisterStateListener = AppState.onChange('authorization', this.updateNav)
        document.addEventListener('click', this.hide)
        this.disconnectedCallback = () => {
            unregisterStateListener()
            document.removeEventListener('click', this.hide)
        }
    }

    connectedCallback() {
        this.querySelectorAll('li').forEach(element => element.addEventListener('click', this.onNavClick))
        this.updateNav(AppState.get('authorization'))
    }

    private readonly onNavClick = (event: Event) => {
        event.preventDefault()
        const target = event.target as HTMLElement
        let route
        if (target instanceof HTMLAnchorElement) {
            route = target.href
            logger.debug('Target is "a" and Route is ' + route)
        } else {
            logger.debug('Looking for li parent')
            let li = target
            while (!(li instanceof HTMLLIElement) && li.parentElement) {
                li = li.parentElement
            }
            route = li.querySelector('a')?.href
            logger.debug('Route is ' + route)
        }
        if (!route) {
            return logger.error('No route specified on element')
        }
        if (!route.includes('#')) {
            logger.debug('Loading page')
            return AppNavigator.load(route)
        }
        route = route.split('#')[1]
        logger.debug('Routing: ' + route)
        AppNavigator.push(route)
    }

    private readonly hide = (ev: Event) => {
        if (FaqToggle.wasTrigger(ev)) return
        this.classList.add('hidden')
    }
    private readonly updateNav = (token: string | undefined) => {
        logger.debug(token)
        this.customiseNavbar(token !== undefined)
        this.highlightNav(AppNavigator.getPageName())
    }

    /**
     * 
     * @param loggedIn if true, anonymous items are hidden and protected ones shown. If false, the opposite is true.
     *                  Items that are neither protected nor anonymous are always shown
     */
    private customiseNavbar(loggedIn: boolean) {
        this.querySelectorAll('li').forEach((element) => {
            const link = element.querySelector('a')
            const attrs = link?.getAttributeNames() ?? []
            if (loggedIn && attrs.includes('anonymous')) {
                element.classList.add('hidden')
            } else if (!loggedIn && attrs.includes('protected')) {
                element.classList.add('hidden')
            } else {
                element.classList.remove('hidden')
            }
        })

    }

    private highlightNav(page: string) {
        this.querySelectorAll('li').forEach(element => {
            const link = element.querySelector('a')?.href.replace(`${window.location.origin}/`, '') || 'home'
            if (link === page) {
                element.classList.add('currentpage')
            } else {
                element.classList.remove('currentpage')
            }
        })
        nonNil(this.querySelector('nav')).style.visibility = 'visible'
    }
}

customElements.define('faq-nav-bar', FaqNavBar)

