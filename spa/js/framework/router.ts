import { nonNil } from '../util.js'
import setTitleArea from '../view/layout/set-title-area.js'
import getLogger from './logger.js'
import Notifications from './notifications.js'
import type { ViewBuilderModule } from './view-builder'

interface Route {
    contentId?: string;
    templateId?: string
    test(path: string): boolean
    getArgs(path: string): Record<string, string>
    script: string
    isRoot: boolean
}

type RouteOptions = {contentId: string|undefined, script: string, route: string, isRoot: boolean, hasTemplate: boolean}
const logger = getLogger()
const routes: Route[] = []

/**
 * Register a route that will be check when the page loads, or when loadRout() is called
 */
export function addRoute(args: RouteOptions & { hasTemplate: true }): string;
export function addRoute(args: RouteOptions & { hasTemplate: false }): void;
export function addRoute({ script, isRoot, hasTemplate, route, contentId }: RouteOptions) {
    const templateId = hasTemplate ? toSafeId(route) : undefined
    if (route.includes(':')) {
        routes.push({
            contentId,
            templateId,
            test: (path: string) => {
                const routeMatcherRegEx = new RegExp(`^${routeParamPattern(route)}$`)
                return routeMatcherRegEx.test(path)
            },
            getArgs: path => getArgs(route, path),
            script,
            isRoot
        })
    } else {
        routes.push({
            contentId,
            templateId,
            test(path: string) {
                return path === route
            },
            getArgs: () => ({}),
            script,
            isRoot
        })
    }
    logger.debug('ROUTE ADDED:', route, JSON.stringify(routes[routes.length - 1]))
    return templateId
}

/**
 * Loads a route into the main section of the page
 */
export async function loadRoute(page: string): Promise<boolean> {
    const route = find(page)
    if (!route) {
        logger.warn('No route found for', page)
        // AppNavigator.replace('/')
        Notifications.error('Unable to load page')
        return false
    }

    try {
        const node = getRootNode(route)
        const module = await import(route.script) as ViewBuilderModule
        setTitleArea('DnSO')
        const { searchParams } = new URL(location.href)
        await module.setup(node, route.getArgs(page), searchParams)

        const article = nonNil(document.querySelector('#faq-app-content > article'))
        while (article.lastChild) article.removeChild(article.lastChild) // remove any content from the article element
        article.appendChild(node) // insert the DOM fragment into the page
        article.id = route.contentId ?? page.replace(/\//g, '__')
        return true
        // replace contents of the page with the correct template
    } catch (err) {
        logger.error(`Failed to load script for "${page}" page`, err)
    }
    return false
}

export function isRoot(path: string) {
    return !!find(path)?.isRoot
}
function getRootNode(route: Route): DocumentFragment {
    if (!route.templateId) return new DocumentFragment()

    const template = document.querySelector(`template#${route?.templateId}`) as HTMLTemplateElement
    return template.content.cloneNode(true) as DocumentFragment // get a copy of the template
}

function find(page: string) {
    return routes.find(r => r.test(page))
}

///
/// Code below is adapted from: https://ultimatecourses.com/blog/deno-http-get-with-params
///
type RouteParam = {
    idx: number
    paramKey: string
}
/**
 * Extract all the route params out of the route into an array of RouteParam.
 * Example: /api/user/:id => [{ idx: 2, paramKey: 'id' }]
 * @param route the configured route with params
 */
const extractRouteParams: (route: string) => RouteParam[] = (route) =>
    route.split('/').reduce((accum: RouteParam[], curr: string, idx: number) => {
        if (/:[A-Za-z1-9]{1,}/.test(curr)) {
            const paramKey: string = curr.replace(':', '')
            const param: RouteParam = { idx, paramKey }
            return [...accum, param]
        }
        return accum
    }, [])

const routeParamPattern: (route: string) => string = (route) =>
    route.replace(/\/:[^/]{1,}/gi, '/[^/]{1,}').replace(/\//g, '\\/')


function getArgs(route: string, path: string): Record<string, string> {
    const params = extractRouteParams(route)
    const segments = path.split('/')
    const args: Record<string, string> = {}
    for (const param of params) {
        args[param.paramKey] = segments[param.idx]
    }
    return args
}

/**
 * Returns a string that is a valid ID attribute
 */
function toSafeId(route: string): string {
    return route.replace(/(:|\/)/g, '__')
}