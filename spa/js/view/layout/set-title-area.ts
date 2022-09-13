import { nonNil } from '../../util.js'

export default function setTitleArea(el: string | Element, ...siblings: Element[]) {
    const titleArea = nonNil(document.getElementById('faq-title-area'))
    titleArea.innerHTML = ''
    if (typeof el === 'string') {
        const h1 = document.createElement('h1')
        h1.id = 'faq-page-title'
        h1.innerHTML = el
        titleArea.appendChild(h1)
    } else {
        titleArea.append(el)
    }

    if (siblings.length) {
        titleArea.append(...siblings)
    }
}