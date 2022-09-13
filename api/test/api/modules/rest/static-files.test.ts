/* textSearch.js */
import {
    assertEquals,
    assertNotEquals,
    assertStringIncludes,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    beforeAll,
    beforeEach,
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";
import { superoak } from 'https://deno.land/x/superoak@4.7.0/mod.ts'
import app from '../../../../app.ts'

const INDEX_FILE_CONTENT = '<script type="module" src="/js/main.js" defer></script>'
let responseText: string, responseType: string

async function get(path: string) {
    responseText = responseType = ''
    const request = await superoak(app);
    const response = await request.get(path).send()
    responseText = response.text
    responseType = response.get('content-type') as string ?? ''
}

describe('When a request to an existing css resource is made', { sanitizeOps: false }, () => {
    beforeAll(() => get('/style/main.css'))
    it('Then the resource is returned', () => {
        assertNotEquals(responseText.length, 0)
        assertStringIncludes(responseText, '@import url')
    })

    it('Then the resource types is text/css', () => {
        assertStringIncludes(responseType, 'text/css')
    })
})

describe('When a request to an existing js resource is made', { sanitizeOps: false }, () => {
    beforeAll(() => get('/js/main.js'))
    it('Then the resource is returned', () => {
        assertNotEquals(responseText.length, 0)
        assertStringIncludes(responseText, "import './elements/index.js'")
    })

    it('Then the resource types is application/css', () => {
        assertStringIncludes(responseType, 'application/javascript')
    })
})


describe('When a request to a non-existant resource is made', { sanitizeOps: false }, () => {
    beforeEach(() => get('/just/not/anything'))
    it('Then index.html is returned', () => {
        assertNotEquals(responseText.length, 0)
        assertStringIncludes(responseText, INDEX_FILE_CONTENT)
    })

    it('Then the resource types is text/html', () => {
        assertStringIncludes(responseType, 'text/html')
    })
})

describe('When a request to a protected respouce', { sanitizeOps: false }, () => {

    async function getOne(path: string) {
        const request = await superoak(app);
        const response = await request.get(path).send()
        return response.text
    }
    async function getAll(paths: string[]) {
        const set = new Set<string>()
        for await (const r of paths.map(getOne)) {
            set.add(r)
        }
        return set
    }

    const protectdPaths = ['/package.json', '/package-lock.json', '/.eslint', '/build-tools/precache.js', '/.vsconfig']

    it('Then the index.html page is returned', async () => {
        const responseBoduSet = await getAll(protectdPaths)
        assertEquals(responseBoduSet.size, 1)
        assertStringIncludes(responseBoduSet.values().next().value, INDEX_FILE_CONTENT)
    })
})


