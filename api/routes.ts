
/* routes.js */

import { Router } from 'oak'

import initApi from "./modules/rest/init-api.ts";

const router = new Router()

initApi(router);

export default router

