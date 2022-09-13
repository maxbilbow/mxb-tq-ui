import parseTemplate from '../framework/parse-template.js'
import getLogger from '../framework/logger.js'

interface Options {
    value?: string
}
const logger = getLogger()

export class FaqSearchBar extends HTMLElement {
    static get observedAttributes() {
        return ['value']
    }

    get value() {
        return this.input()?.value
    }
    
    constructor({ value }: Options = {}) {
        super()
        value && this.setAttribute('value', value)
    }

    private input = () => this.querySelector('.faqSearchBar__input') as HTMLInputElement
    private searchBtn = () => this.querySelector('.faqSearchBar__searchBtn') as HTMLButtonElement
    private clearBtn = () => this.querySelector('.faqSearchBar__clearBtn') as HTMLButtonElement
    private container = () => this.querySelector('.faqSearchBar__container') as HTMLDivElement

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'value' && this.input()) {
            this.input().value = newValue ?? ''
        }
    }

    connectedCallback() {
        this.buildContent().catch(logger.error)
    }

    private async buildContent(): Promise<void> {
        const template = await fetch('/js/elements/faq-search-bar.tpl').then(r => r.text())
        if (template == null) throw Error('faq-search-bar template missing')

        const content = parseTemplate(template, {})
        this.appendChild(content)

        const value = this.getAttribute('value')
        if (value) {
            this.input().value = value
        }

        this.clearBtn().addEventListener('click', this.clear)
        this.searchBtn().addEventListener('click', this.search)
        this.input().addEventListener('keyup', ev => {
            if (ev.key !== 'Enter') {
                this.change()
            } else {
                this.search(ev)
            }
        })
        this.change()
    }

    private readonly search = (ev: Event) => {
        ev.preventDefault()
        const event = new Event('search')
        this.dispatchEvent(event)
    }

    private readonly clear = (ev: Event) => {
        ev.preventDefault()
        this.input().value = ''
        const event = new Event('clear')
        this.dispatchEvent(event)
    }

    private readonly change = () => {
        const event = new Event('change')
        this.dispatchEvent(event)
        if (this.value) {
            this.clearBtn().classList.remove('hidden')
            this.container().classList.remove('faqSearchBar__container--empty')
            this.container().classList.add('faqSearchBar__container--notEmpty')
        } else {
            this.clearBtn().classList.add('hidden')
            this.container().classList.add('faqSearchBar__container--empty')
            this.container().classList.remove('faqSearchBar__container--notEmpty')
        }
    }
}

customElements.define('faq-search-bar', FaqSearchBar)
