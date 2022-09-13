import { Status } from "oak";
import type { ValidationError } from "jsonschema"
import type { ErrorResponse } from '../generated/ErrorResponse.d.ts'
import type { Failure } from "../generated/json-api.d.ts";

export abstract class ApiError extends Error {
    abstract readonly statusCode: Status
    readonly causes: Error[]

    get name() {
        return this.constructor.name
    }

    constructor(message?: string, causes?: Error[]);
    constructor(message?: string, cause?: Error);
    constructor(message?: string, causes?: Error[] | Error) {
        super(message)
        if (!causes) {
            this.causes = []
        } else if (causes instanceof Array) {
            this.causes = causes
        } else {
            this.cause = causes
            this.causes = [this.cause]
        }
    }

    toResponse(): ErrorResponse & Failure {
        return {
            errors: [
                ApiError.toJsonApiError(this),
                ...this.causes
                    .filter(e => !!e)
                    .map(e => ApiError.toJsonApiError(e))
            ]
        }
    }

    static toJsonApiError(error: Error, statusCode = Status.InternalServerError) {
        if (error instanceof ApiError) {
            statusCode = error.statusCode
        }
        return {
            title: `${statusCode} ${error.name}`,
            detail: error.message ?? '',
            status: '' + statusCode
        }
    }
}
export class NotFoundError extends ApiError {
    readonly statusCode = Status.NotFound
}

export class NotImplementedError extends ApiError {
    readonly statusCode = Status.NotImplemented
}


export class UnsupportedMediaTypeError extends ApiError {
    readonly statusCode = Status.UnsupportedMediaType
    constructor(message: string, errors?: Error[]) {
        super(message, errors)
    }
}

export class JsonApiValidationError extends UnsupportedMediaTypeError {
    constructor(message: string, readonly errors: ValidationError[]) {
        super(message, errors)
    }
}

export class BadDataError extends ApiError {
    readonly statusCode = Status.BadRequest
}

export class AuthorisationError extends ApiError {
    readonly statusCode = Status.Unauthorized
}

export class NoUserError extends AuthorisationError {
}

export class InternalServerError extends ApiError {
    readonly statusCode = Status.InternalServerError;

    static of(err: unknown) {
        if (err instanceof Error) {
            return new InternalServerError(err.message, [err])
        } else {
            return new InternalServerError(String(err))
        }
    }
}