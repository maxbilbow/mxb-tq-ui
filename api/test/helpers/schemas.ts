import { assert } from "https://deno.land/std@0.131.0/_util/assert.ts";
import Ajv from 'https://esm.sh/ajv'

const ajv = new Ajv({ allErrors: true })

// deno-lint-ignore no-empty-interface no-explicit-any
interface Schema extends Record<string, any> {
}
export async function parseSchema(name: string) {
    const decoder = new TextDecoder('utf-8')
    const json = await Deno.readFile(`./schemas/${name}.json`)
    return JSON.parse(decoder.decode(json)) as Schema
}

// deno-lint-ignore no-explicit-any
export function assertMatchesSchema(object: Schema, schema: Record<string, any>) {
    const validator = ajv.compile(schema)
    const valid = validator(object)
    assert(valid, JSON.stringify(validator.errors, null, 2))
}