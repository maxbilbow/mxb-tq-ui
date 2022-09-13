/**
 * Centralised management of global state. Necessary for certain things such as the auth token
 * 
 * Enables observer/listener patterns
 */

import { assertNotNil } from '../util.js'
import getLogger from './logger.js'

interface ValueListener<T = unknown> {
    (newValue: T | undefined, oldValue: T | undefined): void
}

const logger = getLogger()

const valueListeners = new Map<string, ValueListener[]>()

export function isSignedIn() {
    return !!get('authorization')
}

export function isSignedInAs(username: string) {
    return isSignedIn() && get<string>('username')?.toLowerCase() === username.toLowerCase()
}

export function set(key: string, value: unknown) {
    const oldValue = get(key)
    if (value === undefined) {
        localStorage.removeItem(key)
    } else {
        localStorage.setItem(key, JSON.stringify(value))
    }
    const newValue = get(key)
    notifyListeners(key, oldValue, newValue)
}

export function get<T>(key: string): T | undefined {
    const value = localStorage.getItem(key)
    if (typeof value === 'string') {
        try {
            return JSON.parse(value)
        } catch {
            return <unknown>value as T
        }
    } else {
        return undefined
    }
}

export function remove(key: string) {
    set(key, undefined)
}

export function onChange<T>(key: string, listener: ValueListener<T>): () => void {
    let listeners: ValueListener[] | undefined = valueListeners.get(key)
    if (!listeners) {
        valueListeners.set(key, listeners = [])
    }
    listeners.push(listener as ValueListener)
    return () => {
        assertNotNil(listeners)
        const index = listeners.indexOf(listener as ValueListener)
        listeners.splice(index, index)
    }
}

function notifyListeners(key: string, oldValue: unknown, newValue: unknown) {
    const listeners = valueListeners.get(key)
    listeners?.forEach(callback => {
        try {
            callback(newValue, oldValue)
        } catch (e) {
            logger.error(`AppState listener threw error on value change for "${key}"`, e)
        }
    })
}

export function clear() {
    for (const [key] of valueListeners) {
        remove(key)
    }
    localStorage.clear()
}