import { afterAll, afterEach, beforeAll, beforeEach } from "https://deno.land/std@0.136.0/testing/bdd.ts";
import puppeteer, { Browser, Page, ScreenshotOptions } from "https://deno.land/x/puppeteer@9.0.2/mod.ts";
import serve from './mock-api/serve.ts'

const SCREENSHOTS_DIR = './api/test/ui/.screenshots'

await serve()

const origin = `http://localhost:${serve.port}`
let scCount = 0

export default class BrowserCtrl {
    browser?: Browser
    page?: Page

    doBeforeAll({ path }: { path: string }) {
        beforeAll(() => this.load(path))
        afterAll(() => this.destroy())
    }

    doBeforeEach({ path }: { path: string }) {
        beforeEach(() => this.load(path))
        afterEach(() => this.destroy())
    }

    async load(path: string) {
        this.browser = await puppeteer.launch({ headless: true })
        this.page = await this.browser.newPage()
        await this.page.goto(`${origin}/${path}`, { waitUntil: 'networkidle0' })
        await this.screenshot(path, {fullPage: true})
    }

    async destroy() {
        await this.page?.close()
        await this.browser?.close()
    }

    screenshot(name: string, opts: ScreenshotOptions = {}) {
        name ||= 'home'
        return this.page?.screenshot({ path: `${SCREENSHOTS_DIR}/${++scCount}-${name}.png`, ...opts })
    }
}