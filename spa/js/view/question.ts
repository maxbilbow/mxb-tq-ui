import AppNavigator from '../framework/app-navigator.js'
import parseTemplate from '../framework/parse-template.js'
import { newAnswer } from '../service/answer.service.js'
import * as questionService from '../service/question.service.js'
import setTitleArea from './layout/set-title-area.js'
import type FaqCollection from '../elements/faq-collection'
import type ViewBuilder from '../framework/view-builder'
import * as AppState from '../framework/app-state.js'
import { nonNil } from '../util.js'
import Notifications from '../framework/notifications.js'
import FaqTextarea from '../elements/faq-textarea.js'

export const setup: ViewBuilder = async (node, { id }) => {
    const template = await fetch('/js/view/question.tpl').then(r => r.text())
    const question = await questionService.get(id)
    const questionDiv = parseTemplate(template, question)

    const summaryText = document.createElement('span')
    summaryText.innerText = question.attributes.summary

    if (question.attributes.imageUrl) {
        const container = nonNil(questionDiv.querySelector('figcaption'))
        container.appendChild(summaryText)
    } else {
        const container = nonNil(questionDiv.getElementById('question-summary'))
        container.classList.add('noImage')
        container.innerHTML = ''
        container.appendChild(summaryText)
    }
    if (AppState.isSignedInAs(question.attributes.author)) {
        // Activate edit buttons for Author
        questionDiv.getElementById('question-actions')?.classList.remove('hidden')
        questionDiv.getElementById('edit-question-btn')?.addEventListener('click', ev => {
            ev.preventDefault()
            AppNavigator.push(`/edit-question/${id}`)
        })
        questionDiv.getElementById('delete-question-btn')?.addEventListener('click', async ev => {
            ev.preventDefault()
            await questionService.deleteQuestion(id)
            AppNavigator.pop()
        })
    } else if (AppState.isSignedIn()) {
        // Show answer form for users who are not the author
        questionDiv.getElementById('faq-answer')?.classList.remove('hidden')
        questionDiv.getElementById('new-answer-form')?.addEventListener('submit', async ev => {
            ev.preventDefault()
            const formData = new FormData(ev.target as HTMLFormElement)
            const { body } = Object.fromEntries(formData.entries())
            if (!body) {
                Notifications.warn('Answer cannot be empty')
                return
            }
            const answer = await newAnswer(id, body as string)
            const textarea = (ev.target as Element)?.querySelector('faq-textarea') as FaqTextarea
            textarea.clear()
            const collection = document.getElementById('answer-list') as FaqCollection
            await collection.appendResource(answer)
            window.scrollTo(0, document.body.scrollHeight)
        })
    }

    node.appendChild(questionDiv)
    setTitleArea(question.attributes.title)
}
