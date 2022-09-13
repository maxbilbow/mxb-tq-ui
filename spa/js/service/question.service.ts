import { DeleteResponse } from '../../generated/DeleteResponse'
import type { QuestionResource } from '../../generated/QuestionResource'
import type { QuestionCreate } from '../../generated/QuestionCreate'
import type { QuestionUpdate } from '../../generated/QuestionUpdate'
import type { QuestionResponse } from '../../generated/QuestionResponse'
import Api from './api.service.js'
import getLogger from '../framework/logger.js'

const logger = getLogger()

export async function get(id: string | number): Promise<QuestionResource> {
    const data: QuestionResponse = await Api.get(`/questions/${id}`)
    logger.debug('Returned Data', data)
    return data.data
}

export async function save(question: QuestionCreate | QuestionUpdate, id: string | undefined): Promise<QuestionResource> {
    let response: QuestionResponse
    if (id) {
        response = await Api.put(`/questions/${id}`, {
            data: {
                id,
                type: 'question',
                attributes: question
            }
        }, { secure: true })
    } else {
        response = await Api.post('/questions', {
            data: {
                id: '',
                type: 'question',
                attributes: question
            }
        }, { secure: true })
    }
    return response.data
}

export async function deleteQuestion(questionId: string | number) {
    const response: DeleteResponse = await Api.delete(`/questions/${questionId}`, { secure: true })
    logger.debug('Returned Data', response)
}