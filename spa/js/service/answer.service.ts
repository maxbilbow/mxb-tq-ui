import type { AnswerPostRequest } from '../../generated/AnswerPostRequest'
import type { AnswerResource } from '../../generated/AnswerResource'
import type { AnswerResponse } from '../../generated/AnswerResponse'
import Api from './api.service.js'

export async function newAnswer(questionId: string, body: string): Promise<AnswerResource> {
    const response: AnswerResponse = await Api.post(`/questions/${questionId}/answers`, {
        data: {
            id: '',
            type: 'answer',
            attributes: {
                body
            }
        }
    } as AnswerPostRequest, {
        secure: true
    })
    return response.data
}