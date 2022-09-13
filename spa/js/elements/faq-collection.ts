import parseTemplate from '../framework/parse-template.js'

import type { Resource } from '../../generated/json-api'
import AppNavigator from '../framework/app-navigator.js'
import { assertNotNil } from '../util.js'
import getLogger from '../framework/logger.js'
import Api from '../service/api.service.js'

interface Options {
    src?: string
    tpl?: string
}

const logger = getLogger()

/**
 * A custom UI element that displays a list of JSONAPI Resources, using a custom template
 */
export default class FaqCollection extends HTMLElement {
    private model: Resource[] = []
    static get observedAttributes() {
        return ['src']
    }
    get listItems() {
        return this.querySelectorAll('.faqCollection__listItem')
    }
    constructor({ src, tpl }: Options = {}) {
        super()
        tpl && this.setAttribute('tpl', tpl)
        src && this.setAttribute('src', src)
    }

    attributeChangedCallback(name: string) {
        if (name === 'src') {
            this.build().catch(logger.error)
        }
    }

    async appendResource(...items: Resource[]) {
        this.model.push(...items)
        try {
            await this.buildList()
        } catch (e) {
            logger.error('Failed build answer list', e)
            return [buildErrorElement()]
        }
    }

    async build() {
        const resourcePath = this.getAttribute('src')
        if (!resourcePath) throw Error('src for resource is missing')

        try {
            this.model = await getCollection(resourcePath)
            await this.buildList()
        } catch (e) {
            logger.error('Failed build answer list', e)
            return [buildErrorElement()]
        }

    }

    private async buildList() {
        const templatePath = this.getAttribute('tpl')
        const template = await getTemplate(templatePath, this)
        const children = this.model.map(resource => parseTemplate(template, resource))
        if (!children.length) {
            logger.info('No data found for', templatePath)
            return
        }
        this.innerHTML = ''
        const ul = document.createElement('ul')
        ul.append(...children)
        this.append(ul)
        ul.querySelectorAll('li').forEach(li => {
            li.classList.add('faqCollection__listItem')
            if (!li.dataset.url) return
            li.addEventListener('click', event => {
                event.preventDefault()
                const { url } = li.dataset
                assertNotNil(url)
                AppNavigator.push(url)
            })
        })
        this.dispatchEvent(new Event('FaqCollectionLoad'))
    }
}

customElements.define('faq-collection', FaqCollection)

function buildErrorElement() {
    const div = document.createElement('div')
    div.classList.add('faqNotification--error')
    const p = document.createElement('p')
    p.innerText = 'Unable to fetch data. '
    const a = document.createElement('a')
    a.innerText = 'Retry?'
    a.addEventListener('click', (ev) => {
        ev.preventDefault()
        AppNavigator.reload()
    })
    p.appendChild(a)
    div.appendChild(p)
    return div
}

async function getTemplate(templatePath: string | null, parent: HTMLElement) {
    let template: string | null
    if (templatePath) {
        template = await fetch(templatePath).then(r => r.text())
    } else {
        template = parent.querySelector('template')?.innerHTML ?? null
    }
    if (template === null) throw Error('Template missing')
    return template
}

export async function getCollection(apiPath: string): Promise<Resource[]> {
    const { data } = await Api.get(apiPath)
    return data
}