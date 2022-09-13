import type * as jsonschemaType from "../../../node_modules/jsonschema/lib/index.d.ts"
import * as jsonschemaImpl from "jsonschema"
import { JsonApiValidationError } from "../errors.ts";

const jsonschema = jsonschemaImpl as typeof jsonschemaType


const jsonApiSchema = await parseSchema('json-api');

async function parseSchema(name: string) {
    const decoder = new TextDecoder('utf-8')
    const json = await Deno.readFile(`./schemas/${name}.json`)
    return JSON.parse(decoder.decode(json))
}

/**
 * @throws {JsonApiValidationError} if the json object does not conform to JSON API Schema
 */
function validate(json: unknown, schema: Record<string, unknown>) {
    const result = jsonschema.validate(json, schema);
    if (result.valid) {
        return undefined;
    } else {
        throw new JsonApiValidationError(result.propertyPath, result.errors)
    }
}
export default async function validateSchema(json: unknown, schema: string | Record<string, unknown>) {
    if (typeof schema === 'string') {
        schema = await parseSchema(schema);
    }
    return validate(json, schema as Record<string, unknown>);
}

export function validateJsonApi(json: unknown) {
    return validate(json, jsonApiSchema);
}
