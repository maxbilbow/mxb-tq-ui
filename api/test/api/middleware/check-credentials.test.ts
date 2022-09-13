/* textSearch.js */
import {
    assertEquals,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";
import { Status } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import { IResponse, superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import { API_ROOT, JSON_API_SCHEMA_TYPE } from "../../../config.ts";
import type { JSONAPISchema } from "../../../generated/json-api.d.ts";
import app from '../../../app.ts'
import { MSG_INVALID_TOKEN, MSG_MISSING_TOKEN, MSG_WRONG_AUTH_TYPE } from "../../../modules/util.ts";

const POST_BODY: Readonly<JSONAPISchema> = Object.freeze({
    data: []
})
{
    const noCred = describe({
        name: 'When a valid API POST request is made But credentials are missing',
        sanitizeOps: false,
        async beforeAll(this: Record<string, unknown>) {
            const request = await superoak(app);
            this.response = await request.post(`${API_ROOT}/questions`)
                .set('content-type', JSON_API_SCHEMA_TYPE)
                .send(POST_BODY).expect(Status.Unauthorized)
        }
    })

    it(noCred, `Then the response status is ${Status.Unauthorized}`, function (this: { response: IResponse }) {
        const { statusCode } = this.response
        assertEquals(statusCode, Status.Unauthorized)
    })

    it(noCred, 'Then the error detail is appropriate', function (this: { response: IResponse }) {
        assertEquals(this.response.body?.errors[0].detail, MSG_MISSING_TOKEN)
    })
}
{
    const wrongAuthType = describe({
        name: 'When a valid API POST request is made But the wrong auth type is used',
        sanitizeOps: false,
        async beforeAll(this: Record<string, unknown>) {
            const request = await superoak(app);
            this.response = await request.post(`${API_ROOT}/questions`)
                .set('content-type', JSON_API_SCHEMA_TYPE)
                .set('Authorization', 'Bearer 12345')
                .send(POST_BODY).expect(Status.Unauthorized)
        }
    })

    it(wrongAuthType, `Then the response status is ${Status.Unauthorized}`, function (this: { response: IResponse }) {
        const { statusCode } = this.response
        assertEquals(statusCode, Status.Unauthorized)
    })

    it(wrongAuthType, 'Then the error detail is appropriate', function (this: { response?: IResponse }) {
        assertEquals(this.response?.body?.errors[0].detail, MSG_WRONG_AUTH_TYPE)
    })
}

{
    const badCred = describe({
        name: 'When a valid API POST request is made But credentials are incomplete',
        sanitizeOps: false,
        async beforeAll(this: Record<string, unknown>) {
            const request = await superoak(app);
            this.response = await request.post(`${API_ROOT}/questions`)
                .set('content-type', JSON_API_SCHEMA_TYPE)
                .set('Authorization', 'Basic ' + btoa('hello'))
                .send(POST_BODY).expect(Status.Unauthorized)
        }
    })

    it(badCred, `Then the response status is ${Status.Unauthorized}`, function (this: { response: IResponse }) {
        const { statusCode } = this.response
        assertEquals(statusCode, Status.Unauthorized)
    })

    it(badCred, 'Then the error detail is appropriate', function (this: { response?: IResponse }) {
        assertEquals(this.response?.body?.errors[0].detail, MSG_INVALID_TOKEN)
    })
}
{
    const badCred = describe({
        name: 'When a valid API POST request is made But credentials are invalid',
        sanitizeOps: false,
        async beforeAll(this: Record<string, unknown>) {
            const request = await superoak(app);
            this.response = await request.post(`${API_ROOT}/questions`)
                .set('content-type', JSON_API_SCHEMA_TYPE)
                .set('Authorization', 'Basic foobar')
                .send(POST_BODY).expect(Status.Unauthorized)
        }
    })

    it(badCred, `Then the response status is ${Status.Unauthorized}`, function (this: { response: IResponse }) {
        const { statusCode } = this.response
        assertEquals(statusCode, Status.Unauthorized)
    })

    it(badCred, 'Then the error detail is appropriate', function (this: { response?: IResponse }) {
        assertEquals(this.response?.body?.errors[0].detail, MSG_INVALID_TOKEN)
    })
}