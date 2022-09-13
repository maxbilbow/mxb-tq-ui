
/* reports.ts */

import { parse } from "https://deno.land/std@0.133.0/flags/mod.ts";
import { Application, Context, send, Status } from "oak";

const port = parse(Deno.args)['port'] ?? 9000;

const app = new Application()
app.use(staticFiles)
app.addEventListener('listen', ({ port }) => console.log(`listening on port: ${port}`))
await app.listen({ port })

async function staticFiles(context: Context) {
    const { pathname } = context.request.url
    const path = `${Deno.cwd()}/reports/${pathname}`
    const stats = await Deno.lstat(path)
    if (stats.isFile) {
        // file exists therefore we can serve it
        console.log(path)
        await send(context, context.request.url.pathname, {
            root: `${Deno.cwd()}/reports`,
        })
    } else {
        context.response.status = Status.SeeOther
        context.response.headers.set('location', '/coverage/index.html')
    }
}