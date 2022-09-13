
/* acounts.test.js */

/*
integration tests for the /accounts route
*/

import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import { assert, assertEquals, fail } from 'https://deno.land/std@0.129.0/testing/asserts.ts'

import app from '../../../../app.ts'
import { API_ROOT } from "../../../../config.ts";
import { getToken } from "../test-utils.ts";
import { validateJsonApi } from "../../../../modules/rest/json-api-validator.ts";
import { Status } from "oak";
import type { UserResponse } from "../../../../generated/UserResponse.d.ts";
import "../../../helpers/mock-db.ts";

Deno.test('/users Login', { sanitizeOps: false }, async (t) => {

	const request = await superoak(app)
	const response = await request.get(`${API_ROOT}/users`)
		.set('authorization', getToken())
	const contentType = response.header['content-type']
	const expected = 'application/vnd.api+json'

	await t.step('Then content type is correct', () => {
		assertEquals(contentType, expected, 'incorrect content-type returned')
	})

	await t.step('Then response is a UserResponse', () => {
		const userResponse: UserResponse = response.body
		assertEquals(userResponse.data.type, 'user')
		assertEquals(userResponse.data.id, 'user1')

	})

	await t.step('Then the status is Accepted', () => {
		assertEquals(response.statusCode, Status.Accepted, `Expected reponse to be ${Status.Accepted} but got ${response.statusCode}`)
	})

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail('Response is not api+json: ' + e.message)
		}
	});
});

Deno.test('/users Login without correct token', { sanitizeOps: false }, async (t) => {

	const request = await superoak(app)
	const response = await request.get(`${API_ROOT}/users`)
		.set('authorization', 'Basic #')
	const contentType = response.header['content-type']
	const expected = 'application/vnd.api+json'

	await t.step('Then content type is correct', () => {
		assertEquals(contentType, expected, 'incorrect content-type returned')
	})

	await t.step('Then response is error', () => {
		assert(response.body.errors instanceof Array, 'response should contain errors')
	})

	await t.step('Then error status is Unauthorized', () => {
		assertEquals(response.statusCode, Status.Unauthorized, `Expected reponse to be ${Status.Unauthorized} but got ${response.statusCode}`)
	})

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail('Response is not api+json: ' + e.message)
		}
	});
});


Deno.test('/users Register (error)', { sanitizeOps: false }, async (t) => {

	const request = await superoak(app)
	const response = await request.post(`${API_ROOT}/users`)
		.set('authorization', getToken())
	const contentType = response.header['content-type']
	const expected = 'application/vnd.api+json'
	
	await t.step('Check content type is correct', () => {
		assertEquals(contentType, expected, 'incorrect content-type returned')
	})

	await t.step('Check response is error', () => {
		assert(response.body.errors instanceof Array, 'response should contain errors')
	})

	await t.step('check response conforms to json api', () => {
		try {
			validateJsonApi(response.body);
		} catch (e) {
			fail('Response is not api+json: ' + e.message)
		}
	});
});
