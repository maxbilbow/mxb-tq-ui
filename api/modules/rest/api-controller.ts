import { Status, Router } from 'oak';
import { read } from 'openapi'
import { Meta, Success, TopLevelLinks } from "../../generated/json-api.d.ts";

const schema = await read("./schemas/swagger.yaml");

export function init(router: Router, apiRoot: string) {

    // Return navigable root API JSON 
    router.get(apiRoot, context => {
        const { protocol, host } = context.request.url
        const baseUrl = `${protocol}${host}${apiRoot}`
        const meta: Meta = {
            name: 'DnSO',
            description: 'API for Frequently Asked Questions about SPA development and Deno',
            schema: 'application/vnd.api+json'
        }
        const links: TopLevelLinks = {
            self: baseUrl
        }

        const data: Success = {
            data: [
                {
                    id: 'questions',
                    type: 'link',
                    links: {
                        self: `${baseUrl}/questions`
                    },
                    meta: {
                        name: 'DnSO',
                        description: 'Search questions and post new ones',
                        parameters: schema.paths['/questions']?.get?.parameters
                    }
                },
                {
                    id: 'users',
                    type: 'link',
                    links: {
                        self: `${baseUrl}/users`
                    },
                    meta: {
                        name: 'DnSO',
                        description: 'Register and log in',
                        parameters: schema.paths['/users']?.get?.parameters
                    }
                }
            ],
            meta,
            links
        }
        context.response.status = Status.OK
        context.response.body = JSON.stringify(data, null, 2)
        context.response.headers.set('content-type', 'application/vnd.api+json')
    })
}