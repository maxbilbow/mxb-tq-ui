import { Router } from "oak";
import getLogger from "../../logger.ts";

const logger = getLogger()

export function init(router: Router) {
    router.get("/(.*)", async context => {      
        logger.info('send index.html if nothing else matches')
        const data = await Deno.readTextFile('spa/index.html')
        context.response.headers.set('Content-Type', 'text/html')
        context.response.body = data
    })
}