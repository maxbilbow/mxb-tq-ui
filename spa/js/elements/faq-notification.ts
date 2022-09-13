type Severity = 'error' | 'warn' | 'info' | 'success'

interface Options {
    id?: string
    message?: string,
    delay?: number,
    severity?: 'error' | 'warn' | 'info' | 'success'
}

export default class FaqNotification extends HTMLElement {
    get severity() {
        return this.getAttribute('severity') as Severity
    }

    get delay() {
        const delay = this.getAttribute('delay')
        if (!delay) return -1
        if (+delay > 0) return +delay
        return -1
    }

    constructor({ id, message, delay, severity }: Options = {}) {
        super()
        delay && delay > 0 && this.setAttribute('delay', '' + delay)
        severity && this.setAttribute('severity', severity)
        if (id) {
            this.id = id
        }
        if (message) {
            this.innerText = message
        }
    }

    dismiss() {
        this.remove()
    }

    connectedCallback() {
        this.classList.add('faqNotification')
        this.classList.add(`faqNotification--${this.severity}`)
        const message = this.innerHTML
        this.innerHTML = ''
        const span = document.createElement('span')
        span.innerText = message
        this.appendChild(span)

        const { delay } = this
        if (delay === -1) return // No auto-dismiss

        setTimeout(() => this.dismiss(), delay)
    }
}

customElements.define('faq-notification', FaqNotification)