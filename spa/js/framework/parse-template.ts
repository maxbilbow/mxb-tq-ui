import * as config from '../config.js'
import { isNil } from '../util.js'
import getLogger from './logger.js'

const logger = getLogger()

/**
 * When a template is parsed, Strings wrapped in double {{barcakets}} are inerpreted against any provided bindings
 * 
 * A modest set of interpreters are supported but use of JS evaluation is not for security reasons
 * 
 * @param templateString The template to be parsed
 * @param bindings substitutions to be bound to the parsed template
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function parseTemplate<T extends DocumentFragment>(templateString: string, bindings: Record<string, any>): T {
    templateString = processHtml(templateString, bindings)
    return document.createRange().createContextualFragment(templateString) as T
}

function processHtml(innerHTML: string, bindings: Record<string, unknown> | undefined) {
    bindings = { ...bindings, ...config }

    const matches = innerHTML.match(/\{\{(.+?)\}\}/g)
    matches?.forEach(element => {
        const [key, options] = element.substring(2, element.length - 2).trim().split('|').map(each => each.trim())
        const value = get(bindings, key, options)
        if (value !== undefined) {
            innerHTML = innerHTML.replace(element, value)
        }
    })
    return innerHTML
}

function get(object: Record<string, unknown> | undefined, path: string, options: string | undefined): string | undefined {
    const segments = path.split('.')
    for (const key of segments) {
        if (object === null || object === undefined) return parseValue(undefined, options)
        const index = key.match(/\[(.+?)\]/)?.[0]
        if (index) {
            object = object[`${key.substring(0, key.length - index.length)}`] as Record<string, unknown> | undefined
            object = object?.[index.substring(1, index.length - 1)] as Record<string, unknown> | undefined
        } else {
            object = object[key] as Record<string, unknown> | undefined
        }
    }
    return parseValue(object, options)
}

function parseValue(value: unknown, options: string | undefined): string {
    if (!options) return isNil(value) ? '' : String(value)
    const [parser, ...args] = options.split(':').map(each => each.trim())
    switch (parser) {
        case 'stringify':
            // Parse the oject as a string
            return JSON.stringify(value)
        case 'date':
            // Parse the object as a date
            return new Date(value as number | string).toLocaleDateString()
        case 'datetime':
            // Parse the object as a datetime
            return new Date(value as number | string).toLocaleString()
        case 'default':
            // If null or undefined, use the default value instead
            return isNil(value) ? removeQuotes(args[0]) : String(value)
        case 'html':
            // Convert the text to html
            if (isNil(value)) return ''
            else {
                const p = document.createElement('p')
                p.innerText = parseValue(String(value), undefined)
                return p.innerHTML
            }
        default:
            logger.warn(`no parser found for ${options}`)
            return parseValue(value, undefined)
    }
}

/**
 * Removes quotes from strings stop-gap in leu of cleverer template parsing
 * Avoinging using eval because this can create security risks
 */
function removeQuotes(o: unknown): string {
    if (!o) return isNil(o) ? '' : String(o)
    const s = String(o)
    if (s.startsWith('\'') && s.endsWith('\'')) return s.substring(1, s.length - 1)
    if (s.endsWith('"') && s.endsWith('"')) return s.substring(1, s.length - 1)
    return s
}
