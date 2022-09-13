import { NoUserError } from "../errors.ts";
import { getUserId as getUserIdFromDb } from "../service/user-service.ts";
import { extractCredentials } from "../util.ts";
import { Request } from 'oak'

export default function getUserId(request: Request): Promise<number> {
    const token = request.headers.get('Authorization')
    if (!token) throw new NoUserError()
    const {username} = extractCredentials(token);
    return getUserIdFromDb(username)
}