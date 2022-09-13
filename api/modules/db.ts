
/* db.js */

import { Client } from 'mysql'
import type { ClientConfig } from 'mysql'
import getLogger from "../logger.ts";

const logger = getLogger()

const home = Deno.env.get('HOME')!
logger.info(`HOME: ${home}`)

const connectionData: Record<string, ClientConfig> = {
  '/home/codio': {
    hostname: '127.0.0.1',
    username: 'api',
    password: 'p455w0rd',
    db: 'faq',
    charset: 'utf8mb4' // Allow smilies and things!
  },
  '/app': {
    hostname: Deno.env.get('DB_HOST'),
    username: Deno.env.get('DB_USER'),
    password: Deno.env.get('DB_PASSWORD'),
    db: Deno.env.get('DB_NAME'),
    charset: 'utf8mb4' // Allow smilies and things!
  }
}

connectionData['/Users/maxbilbow'] = connectionData['/home/codio']

const conn = connectionData[home]

logger.info(conn)

let client: Client | undefined;

export class Db {
  async query<T>(sql: string, params?: unknown[]): Promise<T> {
    return (client ?? (client = await new Client().connect(conn))).query(sql, params)
  }
}

export const db = new Db()
export default db