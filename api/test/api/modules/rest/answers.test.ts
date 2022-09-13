
/* acounts.test.js */

/*
integration tests for the /accounts route
*/

import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import { assertEquals, fail } from 'https://deno.land/std@0.129.0/testing/asserts.ts'
import type { AnswerPostRequest } from '../../../../generated/AnswerPostRequest.d.ts'

import app from '../../../../app.ts'
import { API_ROOT } from "../../../../config.ts";
import { validateJsonApi } from "../../../../modules/rest/json-api-validator.ts";
import { Status } from "oak";
import { getToken } from "../test-utils.ts";
import getLogger from "../../../../logger.ts";
import mockDb from "../../../helpers/mock-db.ts";
const logger = getLogger()


function getPostData(): AnswerPostRequest {
	return {
		data: {
			id: '',
			type: 'answer',
			attributes: {
				body: ''
			}
		}
	}
}

Deno.test('GET /questions/:question_id/answers', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.get(`${API_ROOT}/questions/25/answers`)
		.send().expect(Status.OK)

	await t.step('check response returns correct content-type', () => {
		const contentType = response.header['content-type']
		assertEquals(contentType, expectedContentType, `incorrect content-type returned: ${contentType}`)
	});

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail(e.message)
		}
	});
})

let answerId: string

Deno.test('POST /questions/:question_id/answers with authorization', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const requestData = getPostData()
	const response = await request.post(`${API_ROOT}/questions/25/answers`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
		.send(requestData).expect(Status.Created)

	answerId = response.body.data.id

	await t.step('check response returns correct content-type', () => {
		const contentType = response.header['content-type']
		assertEquals(contentType, expectedContentType, `incorrect content-type returned: ${contentType}`)
	});

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail(e.message)
		}
	});
});


Deno.test('PUT /questions/:question_id/answers/:answer_id with authorization', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const requestData = getPostData()
	requestData.data.attributes.body = 'New Body!'
	requestData.data.id = answerId
	const response = await request.put(`${API_ROOT}/questions/25/answers/${answerId}`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
		.send(requestData).expect(Status.Accepted)

	await t.step('check response returns correct content-type', () => {
		const contentType = response.header['content-type']
		assertEquals(contentType, expectedContentType, `incorrect content-type returned: ${contentType}`)
	});

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail(e.message)
		}
	});
});

Deno.test('DELETE /questions/:question_id/answers/:answer_id with authorization', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.delete(`${API_ROOT}/questions/25/answers/${answerId}`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
		.on('error', err => logger.info('ERRORS!', err))
		.send().expect(Status.Accepted)

	await t.step('check response returns correct content-type', () => {
		const contentType = response.header['content-type']
		assertEquals(contentType, expectedContentType, `incorrect content-type returned: ${contentType}`)
	});

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail(e.message)
		}
	});
});


Deno.test('POST /questions/:question_id/answers fails to create new entry ', { sanitizeOps: false }, async (t) => {
	mockDb.setDefaults({affectedRows: 0})
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.post(`${API_ROOT}/questions/25/answers`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
		.send(getPostData()).expect(Status.BadRequest)

	await t.step('check response returns correct content-type', () => {
		const contentType = response.header['content-type']
		assertEquals(contentType, expectedContentType, `incorrect content-type returned: ${contentType}`)
	});

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail(e.message)
		}
	});
});


Deno.test('PUT /questions/:question_id/answers/:answer_id fails to update entry ', { sanitizeOps: false }, async (t) => {
	mockDb.setDefaults({affectedRows: 0})
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.put(`${API_ROOT}/questions/25/answers/${answerId}`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
		.send(getPostData()).expect(Status.BadRequest)

	await t.step('check response returns correct content-type', () => {
		const contentType = response.header['content-type']
		assertEquals(contentType, expectedContentType, `incorrect content-type returned: ${contentType}`)
	});

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail(e.message)
		}
	});
});


