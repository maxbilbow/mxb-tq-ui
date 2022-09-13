
/* index.ts */

import { parse } from "std/flags";
import app from './api/app.ts'
import getLogger from "./api/logger.ts";

const logger = getLogger()

logger.info(JSON.stringify(Deno.version, undefined, 2));

const port = parse(Deno.args)['port'] ?? 8080;

app.addEventListener('listen', ({ port }) => console.log(`listening on port: ${port}`))

await app.listen({ port })
