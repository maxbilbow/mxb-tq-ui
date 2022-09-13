
export const API_ROOT = '/api/v1'
export const JSON_API_SCHEMA_TYPE = 'application/vnd.api+json'

/**
 * Rules for checking whther a particular API endpoint can be accessed without authorisation
 */
export const INSECURE_ENDPOINTS: ((path: string, method: string) => boolean)[] = [
    (path: string, method: string) => `GET:${API_ROOT}` === `${method}:${path}`,
    (path: string, method: string) => `POST:${API_ROOT}/users` === `${method}:${path}`,
    (path: string, method: string) => `GET:${API_ROOT}/questions` === `${method}:${path}`,
    (path: string, method: string) => {
        if (method !== 'GET') return false;
        return /\/questions\/(.*)$/.test(path.substring(API_ROOT.length))
    },
    (path: string, method: string) => {
        if (method !== 'GET') return false;
        return /\/questions\/(.*)\/answers/.test(path.substring(API_ROOT.length))
    }
]