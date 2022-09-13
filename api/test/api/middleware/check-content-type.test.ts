/* textSearch.js */
import {
    assertEquals, assertStringIncludes,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";
import { Status } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import { IResponse, superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import { API_ROOT, JSON_API_SCHEMA_TYPE } from "../../../config.ts";
import type { Failure } from "../../../generated/json-api.d.ts";
import app from '../../../app.ts'
import { JSON_API_ERROR_MESSAGE } from "../../../middleware/check-content-type.ts";
import { JsonApiValidationError } from "../../../modules/errors.ts";


const badHeader = describe({
    name: 'When an API POST request is made But the content type is not application/vnd.api+json',
    sanitizeOps: false,
    async beforeAll(this: Record<string, unknown>) {
        const request = await superoak(app);
        const response = await request.post(`${API_ROOT}/questions`).send({}).expect(Status.UnsupportedMediaType)
        this.statusCode = response.status
        this.responseBody = response.body
    }
})

it(badHeader, `Then the response status is ${Status.UnsupportedMediaType}`, function (this: { statusCode?: number }) {
    const { statusCode } = this
    assertEquals(statusCode, Status.UnsupportedMediaType)
})

it(badHeader, 'Then the error detail specifies the required contnet type', function (this: { responseBody?: Failure }) {
    assertEquals(this.responseBody?.errors[0].detail, JSON_API_ERROR_MESSAGE)
})

const notJsonApi = describe({
    name: 'When an API POST request is mande AND the content type is application/vnd.api+json But the content is not JSONAPISchema',
    sanitizeOps: false,
    async beforeAll(this: Record<string, unknown>) {
        const request = await superoak(app);
        this.response = await request.post(`${API_ROOT}/questions`)
            .set('content-type', JSON_API_SCHEMA_TYPE)
            .send({this: 'is not JSON API schema'}).expect(Status.UnsupportedMediaType)
    }
})

it(notJsonApi, `Then the response status is ${Status.UnsupportedMediaType}`, function (this: { response: IResponse }) {
    const { statusCode } = this.response
    assertEquals(statusCode, Status.UnsupportedMediaType)
})

it(notJsonApi, 'Then the error title contains JsonApiValidationError', function (this: { response: IResponse }) {
    const responseBody = this.response.body as Failure
    assertStringIncludes(responseBody.errors[0].title!, JsonApiValidationError.name)
})


