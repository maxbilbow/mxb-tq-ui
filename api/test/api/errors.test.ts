import {
    beforeAll,
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";

import { ApiError } from "../../modules/errors.ts";
import { Failure } from "../../generated/json-api.d.ts";
import { validateJsonApi } from "../../modules/rest/json-api-validator.ts";
import { assertEquals, assertStringIncludes, fail } from "https://deno.land/std@0.129.0/testing/asserts.ts";

const MSG_1 = 'm1', MSG_2 = 'm2', MSG_3 = 'm3', CODE_1 = 42, CODE_2 = 43

describe('Given an ApiError with 2 causes', () => {
    class MyError extends ApiError {
        statusCode = CODE_1
    }
    class MyCause extends ApiError {
        statusCode = CODE_2
    }
    let response: Failure
    beforeAll(() => {
        const c1 = new MyCause(MSG_2)
        const c2 = new Error(MSG_3)
        // deno-lint-ignore no-explicit-any
        const NULL = null as any
        response = new MyError(MSG_1, [c1, c2, NULL]).toResponse()
    })
    it('Then the error can be converted to a valid JSONAPI Error response', () => {
        try {
			validateJsonApi(response);
		} catch (e) {
			fail(e.message)
		}
    })

    it('Then the response contains 3 errors', () => {
        assertEquals(response.errors.length, 3)
    })

    it('Then first error is the the the root error', () => {
        assertStringIncludes(response.errors[0].title!, MyError.name)
    })

    it('Then second error is the the the first cause', () => {
        assertStringIncludes(response.errors[1].title!, MyCause.name)
    })

    it('Then third error is the the the second cause', () => {
        assertStringIncludes(response.errors[2].title!, Error.name)
    })

    it('Then the API error codes are correct', () => {
        assertEquals(response.errors[0].status, ''+CODE_1)
        assertEquals(response.errors[1].status, ''+CODE_2)
    })

    it('Then the non-API error code is 500', () => {
        assertEquals(response.errors[2].status, '500')
    })

    it('Then title contains the error code and name', () => {
        assertEquals(response.errors[0].title, CODE_1 + ' ' + MyError.name)
        assertEquals(response.errors[1].title, CODE_2 + ' ' + MyCause.name)
        assertEquals(response.errors[2].title, '500 ' + Error.name)
    })

    it('Then details are correct', () => {
        assertEquals(response.errors[0].detail, MSG_1)
        assertEquals(response.errors[1].detail, MSG_2)
        assertEquals(response.errors[2].detail, MSG_3)
    })
})