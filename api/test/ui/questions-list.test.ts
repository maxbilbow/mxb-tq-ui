/* textSearch.js */
import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";
import BrowserCtrl from "./browser-ctrl.ts";

const browserCtrl = new BrowserCtrl()
const idList = Object.freeze([1, 2, 3])

async function isVisible(query: string) {
    const visible = await browserCtrl.page?.$eval(query, node => node.offsetParent)
    return !!visible
}

describe('Given there are 3 questions in the database When the question-list route is loaded', { sanitizeResources: false, sanitizeOps: false }, () => {
    browserCtrl.doBeforeAll({ path: '' })

    it('Then they are displayed in a list', async () => {
        const count = await browserCtrl.page?.$$eval('.questionListItem', nodes => nodes.length)
        assertEquals(count, 3)
    })

    it('Then they each have a title', async () => {
        for await (const id of idList) {
            const title = await browserCtrl.page?.$eval(`#question-${id} .questionListItem__title`, el => el.innerText)
            assertEquals(title, `title${id}`)
        }
    })

    it('Then they each have a summary', async () => {
        for await (const id of idList) {
            const summary = await browserCtrl.page?.$eval(`#question-${id} .questionListItem__summary`, el => el.innerText)
            assertEquals(summary, `summary${id}`)
        }
    })

    it('Then they each contain the author username and creation date', async () => {
        for await (const id of idList) {
            const created = await browserCtrl.page?.$eval(`#question-${id} .postMeta__author`, el => el.innerText)
            assertEquals(created, `By user${id}, 5/${id}/2022`)
        }
    })

    it('Then questions with no answers contain the correct icon', async () => {
        const noAnswersIcon = await isVisible('#question-1 .noAnswersIcon')
        const hasAnswersIcon = await isVisible('#question-1 .hasAnswersIcon')
        const isResolvedIcon = await isVisible('#question-1 .isResolvedIcon')

        assert(noAnswersIcon)
        assert(!hasAnswersIcon)
        assert(!isResolvedIcon)
    })

    it('Then questions with answers contain the correct icon', async () => {
        const noAnswersIcon = await isVisible('#question-2 .noAnswersIcon')
        const hasAnswersIcon = await isVisible('#question-2 .hasAnswersIcon')
        const isResolvedIcon = await isVisible('#question-2 .isResolvedIcon')

        assert(!noAnswersIcon)
        assert(hasAnswersIcon)
        assert(!isResolvedIcon)
    })

    it('Then questions with resolutions contain the correct icon', async () => {
        const noAnswersIcon = await isVisible('#question-3 .noAnswersIcon')
        const hasAnswersIcon = await isVisible('#question-3 .hasAnswersIcon')
        const isResolvedIcon = await isVisible('#question-3 .isResolvedIcon')

        assert(!noAnswersIcon)
        assert(!hasAnswersIcon)
        assert(isResolvedIcon)
    })
})
