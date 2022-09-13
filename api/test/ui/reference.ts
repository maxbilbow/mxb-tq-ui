// deno-lint-ignore-file no-explicit-any

import puppeteer, { ScreenshotOptions } from 'https://deno.land/x/puppeteer@9.0.2/mod.ts'
import { parse } from 'https://deno.land/std@0.136.0/flags/mod.ts'
import getLogger from "../../logger.ts";

const logger = getLogger()

declare const document: any
const SCREENSHOTS_DIR = './api/test/puppeteer/.screenshots'
const args = [`--window-size=${800},${600 + 74}`]
const { headless = true, url = 'http://localhost:8080' } = parse(Deno.args)
let i = 0
const browser = await puppeteer.launch({ headless, slowMo: 50, args })
const page = (await browser.pages())[0]
page.on('console', ({ type, text }) => logger.debug(type(), text()))
await page.goto(url, { waitUntil: 'networkidle0' })
await sc('main-page')
await sc('main-page-full', { fullPage: true })
await page.hover('#faq-user-drawer-toggle')
await sc('hover-over-user-draw')
await page.click('#faq-user-drawer-toggle')
await sc('click-user-draw')
await page.click('.questionListItem')
await sc('select first question')
await sc('select first question full', { fullPage: true })

await page.evaluate(() => document.getElementById('faq-app-content').innerHTML = 'hello!')
await sc('hello')

const pageHeading = await page.evaluate(() => {
    const h1 = document.querySelector('h1')
    return h1.innerText
})
logger.info(pageHeading)

const pageHeading2 = await page.$eval('h1', node => {
    return node.innerText
})
logger.info(pageHeading2)

const content = await page.$$eval('li', nodes => {
    const data = []
    for(const node of nodes) {
        data.push(node.innerText)
    }
    return data
})
logger.info(content)

await browser.close()

logger.info('script completed')

// https://www.testim.io/blog/puppeteer-screenshot/

function sc(name: string, opts: ScreenshotOptions = {}) {
    return page.screenshot({ path: `${SCREENSHOTS_DIR}/${++i}-${name}.png`, ...opts })
}