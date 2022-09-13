// deno-lint-ignore-file no-explicit-any
import {
    assert,
    assertEquals,
    assertStringIncludes,
    fail,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    beforeAll,
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";
import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import app from '../../../../app.ts'
import type { Success } from "../../../../generated/json-api.d.ts";
import { API_ROOT, JSON_API_SCHEMA_TYPE } from "../../../../modules/rest/api-config.ts";
import { validateJsonApi } from "../../../../modules/rest/json-api-validator.ts";
import { JsonApiValidationError } from "../../../../modules/errors.ts";

describe('When a request to the API root', { sanitizeOps: false }, () => {
    let responseBody: Success
    beforeAll(async () => {
        const request = await superoak(app);
        const response = await request.get(API_ROOT).send()
        responseBody = response.body
    })

    it('Then the response contains all top level links', () => {
        assertStringIncludes((responseBody.data as any)?.[0]?.links.self ?? '', '/questions')
        assertStringIncludes((responseBody.data as any)?.[1]?.links.self ?? '', '/users')
    })

    it('Then the meta property contains information about the API', () => {
        assert(!!responseBody.meta?.name)
        assert(!!responseBody.meta?.description)
        assertEquals(responseBody.meta?.schema, JSON_API_SCHEMA_TYPE)
    })

    it('Then the error can be converted to a valid JSONAPI Error response', () => {
        try {
            validateJsonApi(responseBody);
        } catch (e) {
            fail(JSON.stringify((e as JsonApiValidationError).causes, null, 2))
        }
    })
})


