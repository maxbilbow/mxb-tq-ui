
/* middleware.ts */

import type { Context } from 'oak'

export type MockMiddleware = (context: Context, respond: () => void) => Promise<void> | void
const mockHandlers: MockMiddleware[] = []

export async function onRequest(context: Context, next: () => Promise<unknown>) {
    let called = false
    for await (const handler of mockHandlers) {
        await handler(context, () => {
            called = true
        })
        if (called) break
    }
    if (called) return
    await next()
}

export default class Middleware {
    static addMock(handler: MockMiddleware) {
        mockHandlers.push(handler)
        return {
            remove: () => {
                mockHandlers.splice(mockHandlers.indexOf(handler))
            }
        }
    }

    static reset() {
        mockHandlers.length = 0
    }
}