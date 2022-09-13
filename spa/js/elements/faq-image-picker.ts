import getLogger from '../framework/logger.js'
import parseTemplate from '../framework/parse-template.js'
import { file2DataURI } from '../util.js'

const logger = getLogger()

export interface FaqImagePickerCtrl {
    onChange(file: File | undefined): void
}

/**
 * Custom image picker that supports a preview and easy deletion
 */
export default class FaqImagePicker extends HTMLElement {
    constructor({ name, label, currentSrc }: { name?: string, currentSrc?: string, label?: string } = {}) {
        super()
        name && this.setAttribute('name', name)
        label && this.setAttribute('label', label)
        currentSrc && this.setAttribute('current-src', currentSrc)
    }

    get hasImage() {
        return !this.previewBox().classList.contains('hidden')
    }

    private previewBox = () => this.querySelector('.faqFilePickerPreview') as HTMLDivElement

    private img = () => this.querySelector('.faqFilePickerPreview__image') as HTMLImageElement

    private clearBtn = () => this.querySelector('.faqFilePickerPreview__clearBtn') as HTMLButtonElement

    private fileInput = () => this.querySelector('input.faqFilePicker__input') as HTMLInputElement

    private uploadBtn = () => this.querySelector('input.faqFilePicker__button') as HTMLInputElement

    connectedCallback() {
        this.buildContent().catch(logger.error)
    }

    private async buildContent(): Promise<void> {
        const template = await fetch('/js/elements/faq-image-picker.tpl').then(r => r.text())
        if (template == null) throw Error('faq-image-picker template missing')
        const bindings = {
            label: this.getAttribute('label'),
            name: this.getAttribute('name')
        }
        const content = parseTemplate(template, bindings)
        this.appendChild(content)
        this.updateImage()
        const fileInput = this.fileInput()
        fileInput.addEventListener('change', event => {
            event.preventDefault()
            this.removeAttribute('current-src')
            const file = (event.target as HTMLInputElement).files?.[0]
            logger.debug('File selected', file?.name)
            this.updateImage(file)
        })
        this.clearBtn().addEventListener('click', event => {
            event.preventDefault()
            this.removeAttribute('current-src')
            this.updateImage()
        })
    }

    private async updateImage(newSrc?: Blob) {
        let src: string | null
        if (newSrc) {
            src = await file2DataURI(newSrc) as string
        } else {
            src = this.getAttribute('current-src')
        }
        const img = this.img(), preview = this.previewBox(), btn = this.uploadBtn()
        if (src) {
            img.src = src
            preview.classList.remove('hidden')
            btn.classList.add('hidden')
            logger.debug('image displayed')
        } else {
            img.src = ''
            preview.classList.add('hidden')
            btn.classList.remove('hidden')
            logger.debug('image removed')
        }
    }
}

customElements.define('faq-image-picker', FaqImagePicker)
