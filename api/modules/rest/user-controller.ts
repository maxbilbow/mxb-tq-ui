import { Router, Status } from 'oak'
import { login, register } from '../service/user-service.ts'
import { extractCredentials } from '../util.ts'
import type { UserRegistrationRequest } from '../../generated/UserRegistrationRequest.d.ts'
import type { UserResponse } from '../../generated/UserResponse.d.ts'
import { AuthorisationError } from "../errors.ts";
import getLogger from "../../logger.ts";

const logger = getLogger()

export function init(router: Router, apiRoot: string) {
    router.get(`${apiRoot}/users`, async context => {
        logger.info(`GET ${apiRoot}/users`)
        const token = context.request.headers.get('Authorization')
        logger.info(`auth: ${token}`)
        context.response.headers.set('Content-Type', 'application/vnd.api+json')
        try {
            const credentials = extractCredentials(token!)
            logger.info('Loggin in with credentials for:', credentials.username)
            const username = await login(credentials)
            logger.info(`username: ${username}`)
            context.response.body =  {
                data: {
                    id: username,
                    type: 'user'
                }
            } as UserResponse
            context.response.status = Status.Accepted
        } catch (err) {
            if (err instanceof AuthorisationError) throw err
            throw new AuthorisationError(err.message)
        }
    })

    router.post(`${apiRoot}/users`, async context => {
        logger.info(`POST ${apiRoot}/users`)
        const body = context.request.body({type: 'json'})
        const { data } = await body.value as UserRegistrationRequest
        logger.info('New user:', data.attributes.username)

        context.response.status = Status.Created
        context.response.body = {
            data: {
                id: await register(data.attributes),
                type: 'user'
            }
        } as UserResponse
    })
}