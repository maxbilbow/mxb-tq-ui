import { addRoute } from '../framework/router.js'

/**
 * A shorthand for defining routes and where to find their driving scrips
 */
export default class FaqRoute extends HTMLElement {
    get script() {
        return this.getAttribute('src') ?? ''
    }

    get route() {
        return this.getAttribute('route') ?? ''
    }

    get isRoot() {
        return this.hasAttribute('no-back')
    }

    get contentId() {
        return this.getAttribute('content-id') ?? undefined
    }

    constructor({ src = '', route = '' } = {}) {
        super()
        src && this.setAttribute('src', src)
        route && this.setAttribute('route', route)
    }

    connectedCallback() {
        const { contentId, route, isRoot, script } = this
        if (this.innerHTML.trim().length) {
            // If route contains html, covert this element to a template with given content
            const templateId = addRoute({ contentId, route, isRoot, script, hasTemplate: true })
            const tpl = document.createElement('template')
            tpl.id = templateId
            this.replaceWith(tpl)
            tpl.innerHTML = this.innerHTML
        } else {
            // If empty, register the route and remove the element
            addRoute({ contentId, route, isRoot, script, hasTemplate: false })
            this.remove()
        }
    }
}

customElements.define('faq-route', FaqRoute)
