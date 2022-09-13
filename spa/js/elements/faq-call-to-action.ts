import AppNavigator from '../framework/app-navigator.js'
import { nonNil } from '../util.js'

export class FaqCallToAction extends HTMLElement {
    constructor(route: string | undefined, title: string | undefined) {
        super()
        route && this.setAttribute('route', route)
        if (title) {
            this.title = title
        }
    }

    connectedCallback() {
        const btn = document.createElement('button')
        const icon = document.createElement('i')
        icon.classList.add('las', 'la-plus')
        btn.append(icon)
        this.appendChild(btn)

        btn.addEventListener('click', () => AppNavigator.push(nonNil(this.getAttribute('route'))))
    }
}

customElements.define('faq-call-to-action', FaqCallToAction)

