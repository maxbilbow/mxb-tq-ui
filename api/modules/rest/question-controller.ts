import { Router, Request, Status } from 'oak'
import QuestionSearchService from '../service/question-search-service.ts'
import QuestionService from '../service/question-service.ts'
import type { QuestionResponse } from "../../generated/QuestionResponse.d.ts";
import type { QuestionPostRequest } from "../../generated/QuestionPostRequest.d.ts";
import type { QuestionSearchResource } from "../../generated/QuestionSearchResource.d.ts";
import type { QuestionPutRequest } from "../../generated/QuestionPutRequest.d.ts";
import type { QuestionPatchRequest } from "../../generated/QuestionPatchRequest.d.ts";
import type { DeleteResponse } from "../../generated/DeleteResponse.d.ts";
import getUserId from "./get-user-id.ts";
import getLogger from "../../logger.ts";

const logger = getLogger()

export function init(router: Router, apiRoot: string) {
    const questionService = new QuestionService()
    const questionSearchService = new QuestionSearchService()
    router
        .get(`${apiRoot}/questions`, async context => {
            logger.info('GET', context.request.url.pathname)

            const { searchParams } = context.request.url;
            const query = searchParams.get('q') ?? '';
            const limit = +(searchParams.get('limit') ?? Number.MAX_SAFE_INTEGER);
            const offset = +(searchParams.has('offset') ?? 0);

            context.response.headers.set('Content-Type', 'application/vnd.api+json')

            const questions = await questionSearchService.search(query, limit, offset)
            const data: QuestionSearchResource[] = questions.map(attributes => ({
                id: attributes.id.toString(),
                type: 'question',
                attributes,
                links: {
                    self: getSelf(attributes.id, context.request.url)
                }
            }))

            context.response.body = {
                data,
                links: {
                    self: context.request.url.toString()
                },
                meta: {
                    total: await questionSearchService.getTotal(query)
                }
            }
            context.response.status = 200
        })
        .get(`${apiRoot}/questions/:questionId`, async context => {
            logger.info('GET', context.request.url.pathname)

            const { questionId } = context.params
            context.response.headers.set('Content-Type', 'application/vnd.api+json')
            context.response.body = await getQuestionResource(questionId!, context.request)
            context.response.status = Status.OK
        })
        .post(`${apiRoot}/questions`, async context => {
            logger.info(context.request.method, context.request.url.pathname)
            const requestBody: QuestionPostRequest = await context.request.body({ type: 'json' }).value;
            const userId = await getUserId(context.request)
            const questionId = await questionService.create(requestBody.data.attributes, userId)

            context.response.headers.set('Content-Type', 'application/vnd.api+json')
            context.response.body = await getQuestionResource(questionId, context.request);
            context.response.status = Status.Created
        })
        .put(`${apiRoot}/questions/:questionId`, async context => {
            logger.info(context.request.method, context.request.url.pathname)
            const { questionId } = context.params
            const requestBody: QuestionPutRequest = await context.request.body({ type: 'json' }).value;
            const userId = await getUserId(context.request)
            await questionService.update(+questionId!, requestBody.data.attributes, userId)
            context.response.headers.set('Content-Type', 'application/vnd.api+json')
            context.response.body = await getQuestionResource(questionId!, context.request);
            context.response.status = Status.Accepted
        })
        .patch(`${apiRoot}/questions/:questionId`, async context => {
            logger.info(context.request.method, context.request.url.pathname)
            const { questionId } = context.params
            const resolved = context.request.url.searchParams.get('resolved') === 'true';
            const requestBody: QuestionPatchRequest = await context.request.body({ type: 'json' }).value;
            const userId = await getUserId(context.request)
            await questionService.setResolved(questionId!, resolved, requestBody.data.attributes.resolutionId, userId)
            context.response.headers.set('Content-Type', 'application/vnd.api+json')
            context.response.body = await getQuestionResource(questionId!, context.request);
            context.response.status = Status.Accepted
        })
        .delete(`${apiRoot}/questions/:questionId`, async context => {
            logger.info(context.request.method, context.request.url.pathname)
            const { questionId } = context.params

            const userId = await getUserId(context.request)
            await questionService.delete(+questionId!, userId)

            context.response.headers.set('Content-Type', 'application/vnd.api+json')
            context.response.body = {
                data: {
                    id: questionId,
                    type: 'question'
                }
            } as DeleteResponse
            context.response.status = Status.Accepted
        });

    async function getQuestionResource(questionId: string | number, request: Request): Promise<QuestionResponse> {
        const attributes = await questionService.get(+questionId!)
        const questionsUrl = getSelf(questionId, request.url)
        return {
            data: {
                id: attributes.id.toString(),
                type: "question",
                attributes,
                links: {
                    self: questionsUrl
                },
                relationships: {
                    answers: {
                        links: {
                            self: `${questionsUrl}/answers`
                        },
                        meta: {
                            total: attributes.answerCount
                        }
                    }
                }
            },
            links: {
                self: request.url.toString(),
            }
        }
    }

    function getSelf(questionId: number | string, { protocol, host }: URL) {
        return `${protocol}//${host}${apiRoot}/questions/${questionId}`
    }
}

