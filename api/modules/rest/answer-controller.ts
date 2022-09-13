import { Router, Request, Status } from 'oak'
import AnswerService from '../service/answer-service.ts'
import type { AnswerSearchResponse } from "../../generated/AnswerSearchResponse.d.ts";
import type { AnswerResource } from "../../generated/AnswerResource.d.ts";
import type { AnswerResponse } from "../../generated/AnswerResponse.d.ts";

import type { DeleteResponse } from "../../generated/DeleteResponse.d.ts";
import getUserId from "./get-user-id.ts";
import type { AnswerPostRequest } from "../../generated/AnswerPostRequest.d.ts";

export function init(router: Router, apiRoot: string) {
    const answerService = new AnswerService();
    router.get(`${apiRoot}/questions/:questionId/answers`, async context => {
        const { questionId } = context.params

        context.response.headers.set('Content-Type', 'application/vnd.api+json')
        context.response.status = Status.OK
        context.response.body = await (async () => {
            const answers = await answerService.getForQuestion(questionId!)
            const data = answers.map(a => ({
                id: a.id.toString(),
                type: 'answer',
                attributes: a
            } as AnswerResource))

            return {
                data,
                links: {
                    self: context.request.url.toString()
                },
                meta: {
                    total: answers.length
                }
            } as AnswerSearchResponse
        })()

    });

    router.get(`${apiRoot}/questions/:questionId/answers/:answerId`, async context => {
        const { questionId, answerId } = context.params
        context.response.headers.set('Content-Type', 'application/vnd.api+json')
        context.response.status = Status.OK
        context.response.body = await answerService.get(+questionId!, +answerId!)
    });

    router.post(`${apiRoot}/questions/:questionId/answers`, async context => {
        const { questionId } = context.params
        const { data } = await context.request.body({ type: 'json' }).value as AnswerPostRequest
        const userId = await getUserId(context.request)
        const answerId = await answerService.create(+questionId!, data.attributes, userId)

        context.response.headers.set('Content-Type', 'application/vnd.api+json')
        context.response.status = Status.Created
        context.response.body = await getAnswerResource(questionId!, answerId, context.request)
    });

    router.put(`${apiRoot}/questions/:questionId/answers/:answerId`, async context => {
        const { questionId, answerId } = context.params
        const { data } = await context.request.body({ type: 'json' }).value as AnswerPostRequest
        const userId = await getUserId(context.request)
        await answerService.update(+questionId!, +answerId!, data.attributes, userId)
        context.response.headers.set('Content-Type', 'application/vnd.api+json')
        context.response.status = Status.Accepted
        context.response.body = await getAnswerResource(questionId!, answerId!, context.request)
    });

    router.delete(`${apiRoot}/questions/:questionId/answers/:answerId`, async context => {
        const { questionId, answerId } = context.params
        const userId = await getUserId(context.request)
        await answerService.delete(+questionId!, +answerId!, +userId);

        context.response.headers.set('Content-Type', 'application/vnd.api+json')
        context.response.status = Status.Accepted
        context.response.body = {
            data: {
                id: answerId,
                type: 'answer'
            }
        } as DeleteResponse
    });

    async function getAnswerResource(questionId: string | number, answerId: string | number, request: Request): Promise<AnswerResponse> {
        const attributes = await answerService.get(+questionId!, +answerId)
        const { host, protocol } = request.url;
        const self = `${protocol}//${host}${apiRoot}/questions/${questionId}`
        return {
            data: {
                id: attributes.id.toString(),
                type: "answer",
                attributes
            },
            links: {
                self
            }
        }
    }
}