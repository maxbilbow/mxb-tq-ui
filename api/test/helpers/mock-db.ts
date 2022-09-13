import { stub, resolvesNext } from "https://deno.land/std@0.136.0/testing/mock.ts";
import db, { Db } from "../../modules/db.ts";
import { hash } from 'bcrypt'
import { salt } from "../../modules/service/user-service.ts";

interface Query {
    (query: string, args: unknown[] | undefined): Promise<unknown>;
}
let queryStub = stub<Db, [string, unknown[] | undefined], Promise<unknown>>(db, 'query', defaultStub({}))

class MockDB {
    // Stub query method to prevent any connections from being openned
    get query() {
        return queryStub
    }
    resolvesNext(...returns: unknown[]) {
        queryStub.restore()
        return queryStub = stub(db, 'query', resolvesNext(returns))
    }

    callFake(fake: Query) {
        queryStub.restore()
        return queryStub = stub(db, 'query', fake)
    }

    setDefaults(options: Record<string, unknown> = {}) {
        return this.callFake(defaultStub(options))
    }
}

function defaultStub({ count = 1, userId = 1, username = 'user1', password = 'p455w0rd', affectedRows = 1, lastInsertId = 42 }: Record<string, unknown>): Query {
    return async (sql) => {
        if (sql.startsWith('INSERT')) {
            return { lastInsertId, affectedRows }
        }
        if (sql.startsWith('UPDATE') || sql.startsWith('DELETE')) {
            return { affectedRows }
        }
        return [{ id: userId, username, password_hash: await hash(password as string, salt), count, lon: 42, lat: 42, location_name: 'Bronkton' }]
    }
}
const mockDb = new MockDB()
export default mockDb