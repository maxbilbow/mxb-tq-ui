import getLogger from '../framework/logger.js'
import Notifications from '../framework/notifications.js'
import parseTemplate from '../framework/parse-template.js'
import { nonNil } from '../util.js'

const logger = getLogger()

/**
 * Specialised text area that can be more easily styled than `<textarea>`
 */
export default class FaqTextarea extends HTMLElement {

    constructor() {
        super()
    }

    get maxlength() {
        return +(this.getAttribute('maxlength') ?? Number.POSITIVE_INFINITY)
    }

    private get input() {
        return nonNil(this.querySelector('input'))
    }

    private get textbox() {
        return nonNil(this.querySelector('pre'))
    }

    /**
     * Sets the initial content when connected to the dom
     */
    connectedCallback() {
        const { innerHTML: value } = this
        this.innerHTML = ''
        logger.info(value)
        this.buildContent(value).catch(logger.error)
    }

    clear() {
        this.textbox.innerHTML = this.input.value = ''
    }

    private async buildContent(value: string): Promise<void> {
        const template = await fetch('/js/elements/faq-textarea.tpl').then(r => r.text())
        if (!template) throw Error('faq-textarea template missing')

        const content = parseTemplate(template, {
            label: this.getAttribute('label'),
            name: this.getAttribute('name')
        })

        this.appendChild(content)
        const { textbox } = this
        textbox.innerHTML = value.trim()
        this.input.value = textbox.innerText
        this.input.required = this.hasAttribute('required')

        textbox.addEventListener('keydown', (ev) => {
            logger.debug('keydown', ev.key, ev.code, ev.location)
            if (ev.key === 'Enter') {
                ev.preventDefault() // Prevent the browser adding a <br>, <p>, <span>, or <div> element
                const LR = textbox.innerText.length ? '\n' : '\n\n'
                insertAtCursor(LR)
            }
        })
        textbox.addEventListener('keyup', this.updateInput)
        textbox.addEventListener('focus', this.updateInput)
        textbox.addEventListener('cut', this.updateInput)
        textbox.addEventListener('paste', ev => {
            // Prevent cpying of html markup
            ev.preventDefault()

            // get text representation of clipboard
            const text = ev.clipboardData?.getData('text/plain')
            if (!text) return

            if (textbox.innerText.trim().length + text.length > this.maxlength) {
                Notifications.warn('Maximum size reached')
                return
            }
            if (insertAtCursor(text)) { this.updateInput(ev) }
        })

    }

    private readonly updateInput = (ev: Event) => {
        const textbox = ev.target as HTMLPreElement
        if (this.input.value.length > this.maxlength) {
            Notifications.warn('Maximum size exceeded')
        }
        logger.info('Updating input')
        // Copy contents to hidden input
        this.input.value = textbox.innerText.trim()
    }
}

customElements.define('faq-textarea', FaqTextarea)

/**
 * Inserts text at the cursors current location and moves the cursor to the end of the new conent
 */
function insertAtCursor(text: string | null | undefined) {
    const selection = window.getSelection()
    if (!(text && selection)) return false

    // Insert text at cursor position
    const range = selection.getRangeAt(0)
    range.deleteContents()
    const node = document.createTextNode(text)
    range.insertNode(node)
    range.setStartAfter(node)
    selection.removeAllRanges()
    selection.addRange(range)
    return true
}