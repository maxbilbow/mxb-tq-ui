import getLogger from '../framework/logger.js'

const logger = getLogger()

class FaqAppHeader extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        logger.info('connected!')
    }
}

customElements.define('faq-app-header', FaqAppHeader, {extends: 'header'})
