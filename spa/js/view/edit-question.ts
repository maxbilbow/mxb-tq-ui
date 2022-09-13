import type FaqImagePicker from '../elements/faq-image-picker.js'
import AppNavigator from '../framework/app-navigator.js'
import Notifications from '../framework/notifications.js'
import getLogger from '../framework/logger.js'
import parseTemplate from '../framework/parse-template.js'
import type ViewBuilder from '../framework/view-builder'
import type { QuestionCreate } from '../../generated/QuestionCreate'
import type { QuestionResource } from '../../generated/QuestionResource'
import type { QuestionUpdate } from '../../generated/QuestionUpdate'
import setTitleArea from './layout/set-title-area.js'
import * as questionService from '../service/question.service.js'
import { file2DataURI } from '../util.js'

const logger = getLogger()

export const setup: ViewBuilder = async (node, { id }) => {
    const template = await fetch('/js/view/edit-question.tpl').then(r => r.text())
    const questionResource = id ? await questionService.get(id) : {
        type: 'question',
        attributes: {
            body: {
                text: ''
            },
            summary: '',
            title: ''
        }
    } as QuestionResource
    const isNew = !questionResource.id
    delete questionResource.attributes.body.html
    const questionDiv = parseTemplate(template, questionResource)
    const imagePicker = questionDiv.querySelector('faq-image-picker') as FaqImagePicker

    if (isNew) setTitleArea('Give us your Question')

    questionDiv.getElementById('edit-question-form')?.addEventListener('submit', async ev => {
        ev.preventDefault()
        const formData = new FormData(ev.target as HTMLFormElement)
        const data = Object.fromEntries(formData.entries())
        if (!(data.summary && data.body)) {
            Notifications.warn('All text fields must be filled')
            return
        }
        const attrs: QuestionCreate | QuestionUpdate = {
            title: data.title as string,
            summary: data.summary as string,
            body: {
                text: data.body as string
            },
            keywords: []
        }

        if (isNew) {
            (attrs as QuestionCreate).location = {
                displayName: 'unknown',
                latitude: 0,
                longitude: 0
            }
        }


        const file = data.image as File
        if (file.size > 0) {
            logger.debug('Adding new image to question attrs')
            attrs.image = await file2DataURI(file)
        } else if (!imagePicker.hasImage) {
            logger.debug('Adding empty image to question attrs')
            attrs.image = ''
        }
        try {
            const { id: newId } = await questionService.save(attrs, questionResource.id)
            if (isNew) {
                AppNavigator.replace(`/question/${newId}`)
            } else {
                AppNavigator.pop()
            }
        } catch (e) {
            Notifications.error((e as Error).message) // TODO: Not a good idea to print raw errors to user
        }
    })

    questionDiv.querySelector('input[name="cancel"]')?.addEventListener('click', ev => {
        ev.preventDefault()
        AppNavigator.pop()
    })
    node.appendChild(questionDiv)
}