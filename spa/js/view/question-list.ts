import setTitleArea from './layout/set-title-area.js'
import { FaqSearchBar } from '../elements/faq-search-bar.js'
import AppNavigator from '../framework/app-navigator.js'
import type ViewBuilder from '../framework/view-builder'
import parseTemplate from '../framework/parse-template.js'
import { getQueryString, nonNil } from '../util.js'
import FaqCollection from '../elements/faq-collection.js'
import * as AppState from '../framework/app-state.js'

export const setup: ViewBuilder = async (node, pathParams, searchParams) => {
    const query = searchParams.get('q') ?? ''
    const tpl = await (await fetch('/js/view/question-list.tpl')).text()
    const view = parseTemplate(tpl, {
        query
    })

    const searchBar = new FaqSearchBar({ value: query })
    setTitleArea('Questions', searchBar)

    searchBar.addEventListener('search', ev => {
        const target = ev.target as FaqSearchBar
        AppNavigator.replace(`/question-list${getQueryString({ q: target.value })}`)
    })

    searchBar.addEventListener('clear', () => AppNavigator.replace('/question-list'));

    (view.querySelector('faq-collection') as FaqCollection).addEventListener('FaqCollectionLoad', (ev) => {
        (ev.target as FaqCollection).listItems.forEach(el => {
            const li = el as HTMLElement
            if (li.dataset.resolutionId) {
                li.classList.add('questionListItem--isResolved')
            } else if (+nonNil(li.dataset.answerCount) > 0) {
                li.classList.add('questionListItem--hasAnswers')
            } else {
                li.classList.add('questionListItem--noAnswers')
            }
        })
    })

    if (!AppState.isSignedIn()) {
        // Remove CTA button for unauthorised users
        view.querySelector('faq-call-to-action')?.remove()
    }

    node.append(view)
}

