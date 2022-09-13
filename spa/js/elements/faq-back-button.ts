import AppNavigator from '../framework/app-navigator.js'
import getLogger from '../framework/logger.js'

const logger = getLogger()
export class FaqBackButton extends HTMLElement {
    readonly disconnectedCallback

    constructor() {
        super()
        this.disconnectedCallback = AppNavigator.onStateChange(this.update)
    }

   
    connectedCallback() {
        AppNavigator.onStateChange(this.update)
        this.addEventListener('click', () => AppNavigator.pop())
        this.update()
    }

    private update = () => {
        logger.info('Initialising back button')
        this.hide()
        setTimeout(() => { // Run in timeout to allow AppNavigator to initialise
            if (AppNavigator.canGoBack()) {
                logger.info('showing back button')
                this.show()
            } else {
                logger.info('hiding back button')
                this.hide()
            }
        })
    }

    private hide() {
        this.parentElement?.classList.add('noBack')
    }

    private show() {
        this.parentElement?.classList.remove('noBack')
    }
}

customElements.define('faq-back-button', FaqBackButton)
