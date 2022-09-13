
/* acounts.test.js */

/*
integration tests for the /accounts route
*/

import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import { assertEquals, assertStringIncludes, fail } from 'https://deno.land/std@0.129.0/testing/asserts.ts'
import type { QuestionPostRequest } from '../../../../generated/QuestionPostRequest.d.ts'
import type { QuestionPutRequest } from '../../../../generated/QuestionPutRequest.d.ts'
import type { QuestionPatchRequest } from '../../../../generated/QuestionPatchRequest.d.ts'
import type { QuestionResponse } from '../../../../generated/QuestionResponse.d.ts'

import app from '../../../../app.ts'
import { API_ROOT } from "../../../../config.ts";
import { validateJsonApi } from "../../../../modules/rest/json-api-validator.ts";
import { Status } from "oak";
import { getToken } from "../test-utils.ts";
import mockDb from "../../../helpers/mock-db.ts";

function getPostData(): QuestionPostRequest {
	return {
		data: {
			id: '',
			type: 'question',
			attributes: {
				body: {
					text: ''
				},
				keywords: [],
				summary: '',
				title: ''
			}
		}
	}
}

function getPutData(): QuestionPutRequest {
	return {
		data: {
			id: questionId,
			type: 'question',
			attributes: {
				body: { text: 'NEw Body' },
				keywords: [],
				summary: 'New Sum',
				title: 'NEw Title'
			}
		}
	}
}

let questionId: string

Deno.test('GET /questions', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.get(`${API_ROOT}/questions`).send().expect(200)

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

// deno-lint-ignore ban-untagged-todo
// TODO: query params not working with superoak
Deno.test('GET /questions with parameters', { sanitizeOps: false, ignore: true }, async (t) => { 
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.get(`${API_ROOT}/questions`)
		.query({ q: ['whatever'], limit: ['1'], offset: ['2'] })
		.expect(200)

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

	await t.step('check the correct arguments were included in the SQL query', () => {
		const [sql, args] = mockDb.query.calls.at(0)?.args as [string, unknown[]]

		console.log('HEHEHEHEHERE', sql, args)
		assertStringIncludes(sql, 'q.`title` LIKE ?')
		assertEquals(args, ['%whatever%', 1, 2])
	})
})

Deno.test('GET /questions/:id ', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.get(`${API_ROOT}/questions/40`).send().expect(200)

	await t.step('check response returns correct content-type', () => {
		const contentType = response.header['content-type']
		assertEquals(contentType, expectedContentType, `incorrect content-type returned: ${contentType}`)
	});

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail('Response is not valid json+api: \n - ' + e.errors.map((each: Error) => each.message).join('\n - ')
				+ '\n' + JSON.stringify(response.body, null, 2))
		}
	});
});


Deno.test('POST /questions with authorization', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const requestData = getPostData()
	const response = await request.post(`${API_ROOT}/questions`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
		.send(requestData).expect(Status.Created)

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

	questionId = (response.body as QuestionResponse).data.id
});


Deno.test('PUT /questions/:id with authorization', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const requestData = getPutData()
	const response = await request.put(`${API_ROOT}/questions/${requestData.data.id}`)
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

Deno.test('PATCH /questions/:id with authorization', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.patch(`${API_ROOT}/questions/${questionId}?resolved=true`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
		.send({
			data: {
				id: questionId,
				type: 'questions',
				attributes: {
					resolutionId: 1
				}
			}
		} as QuestionPatchRequest).expect(Status.Accepted)

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

Deno.test('DELETE /questions/:question_id with authorization', { sanitizeOps: false }, async (t) => {
	const expectedContentType = 'application/vnd.api+json'
	const request = await superoak(app)
	const response = await request.delete(`${API_ROOT}/questions/${questionId}`)
		.set('content-type', expectedContentType)
		.set('authorization', getToken())
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
