import getLogger from '../framework/logger.js'

const logger = getLogger()

/**
 * Simple toggle button that toggles the visibility of a provided query-selector target 'for'
 */
export default class FaqToggle extends HTMLElement {

    constructor() {
        super()
        this.addEventListener('click', this.toggle)
    }

    private readonly toggle = (ev: Event) => {
        ev.preventDefault()
        const selector = this.getAttribute('for')
        if (!selector) {
            return logger.error('faq-toggle: "for" attribute not provided')
        }
        document.querySelectorAll(selector).forEach(el => el.classList.toggle('hidden'))
    }

    static wasTrigger({ target }: Event) {
        if (target instanceof FaqToggle) return true
        if ((target as Element).parentElement instanceof FaqToggle) return true
        return false
    }
}

customElements.define('faq-toggle', FaqToggle)

