// deno-lint-ignore-file no-explicit-any
import {
    assert, assertArrayIncludes, assertEquals, assertNotEquals, assertStringIncludes,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    beforeAll,
    beforeEach,
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";
import { BadDataError } from "../../../modules/errors.ts";
import * as UserService from "../../../modules/service/user-service.ts";

import {
    Stub,
} from "https://deno.land/std@0.136.0/testing/mock.ts";
import mockDb from '../../helpers/mock-db.ts';

describe('When user credentials are registered But the username field is empty', { sanitizeOps: false }, () => {
    let response: unknown
    beforeEach(async () => {
        response = await UserService.register({ username: '', password: '' }).catch(e => e)
    })
    it('Then a BadDataError is thrown', () => {
        assert(response instanceof BadDataError, 'Expected BadDataError but found ' + (response as any)?.name ?? response)
    })
    it('Then the error message is appropriate', () => {
        assertEquals((response as BadDataError).message, 'Username not provided')
    })
})

describe('When user credentials are registered But no password is provided', { sanitizeOps: false }, () => {
    let response: unknown
    beforeEach(async () => {
        response = await UserService.register({ username: 'user', password: '' }).catch(e => e)
    })
    it('Then a BadDataError is thrown', () => {
        assert(response instanceof BadDataError, 'Expected BadDataError but found ' + (response as any)?.name ?? response)
    })
    it('Then the error message is appropriate', () => {
        assertEquals((response as BadDataError).message, 'Password not valid')
    })
})

describe('When valid user credentials are registered', { sanitizeOps: false }, () => {
    let response: unknown
    let queryStub: Stub
    beforeAll(async () => {
        queryStub = mockDb.resolvesNext({ lastInsertedId: 42 })
        response = await UserService.register({ username: 'user', password: 'pass' }).catch(e => e)
    })

    it('Then an insert query was made', () => {
        assertStringIncludes(queryStub.calls[0].args[0], 'INSERT INTO users(username, password_hash) VALUES(?, ?)')
    })

    it('Then the username was inserted', () => {
        assertArrayIncludes(queryStub.calls[0].args[1][0], 'user')
    })

    it('Then the password hash was inserted', () => {
        const hash = queryStub.calls[0].args[1][1]
        assertNotEquals(hash, 'pass')
        assertNotEquals(hash.length, 0)
    })

    it('Then the given username is returned', () => {
        assertEquals(response, 'user')
    })
})