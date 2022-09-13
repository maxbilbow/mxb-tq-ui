import {
    beforeAll,
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";


import { assertEquals } from "https://deno.land/std@0.129.0/testing/asserts.ts";
import type { Failure } from "../../../generated/json-api.d.ts";
import { ApiError, InternalServerError } from "../../../modules/errors.ts";
import errorHandler from "../../../middleware/error-handler.ts";
import { Context } from "https://deno.land/x/oak@v10.5.1/mod.ts";

const MSG_1 = 'm1', MSG_2 = 'm2', MSG_3 = 'm3'

class MyApiError extends ApiError {
    statusCode = 42
    message = MSG_1
}

class MyServerError extends Error {
    statusCode = 42
    message = MSG_2
}

function mockContext(): Context {
    return {
        request: {
            url: {
                pathname: 'pathname'
            },
            method: 'GET'
        },
        response: {

        }
    } as Context
}

describe('When a request triggers an ApiError', () => {
    let next: () => Promise<unknown>
    let context: Context
    let responseBody: Failure | undefined
    beforeAll(async () => {
        next = () => {
            throw new MyApiError()
        }
        context = mockContext()
        await errorHandler(context, next).catch(e => e)
        // deno-lint-ignore no-explicit-any
        responseBody = context.response.body as any
    })

    it('Then the response status is of my API error', () => {
        const { status } = context.response
        assertEquals(status, 42)
    })

    it('Then a JSONSchema ApiError is returned', () => {
        const { title, detail, status } = responseBody?.errors[0] ?? {}
        assertEquals(title, `42 ${MyApiError.name}`)
        assertEquals(detail, MSG_1)
        assertEquals(status, '42')
    })
})

describe('When a request triggers an internal server error', () => {
    let next: () => Promise<unknown>
    let context: Context
    let responseBody: Failure | undefined
    beforeAll(async () => {
        next = () => {
            throw new MyServerError()
        }
        context = mockContext()
        await errorHandler(context, next).catch(e => e)
        // deno-lint-ignore no-explicit-any
        responseBody = context.response.body as any
    })

    it('Then the response status is an internal server error (500)', () => {
        const { status } = context.response
        assertEquals(status, 500)
    })

    it('Then a JSONSchema ApiError is returned', () => {
        const { title, detail, status } = responseBody?.errors[0] ?? {}
        assertEquals(title, `500 ${InternalServerError.name}`)
        assertEquals(detail, MSG_2)
        assertEquals(status, '500')
    })
})

describe('When a request triggers a non standard error', () => {
    let next: () => Promise<unknown>
    let context: Context
    let responseBody: Failure | undefined
    beforeAll(async () => {
        next = () => {
            throw MSG_3
        }
        context = mockContext()
        await errorHandler(context, next).catch(e => e)
        // deno-lint-ignore no-explicit-any
        responseBody = context.response.body as any
    })

    it('Then the response status is an internal server error (500)', () => {
        const { status } = context.response
        assertEquals(status, 500)
    })

    it('Then a JSONSchema ApiError is returned', () => {
        const { title, detail, status } = responseBody?.errors[0] ?? {}
        assertEquals(title, `500 ${InternalServerError.name}`)
        assertEquals(detail, MSG_3)
        assertEquals(status, '500')
    })
})