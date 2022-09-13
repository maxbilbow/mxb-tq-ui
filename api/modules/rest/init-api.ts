import * as Questions from "./question-controller.ts"
import * as Answers from "./answer-controller.ts"
import * as Users from "./user-controller.ts"
import * as Api from './api-controller.ts'
import * as Fallback from './fallback-controller.ts'
import { API_ROOT } from "../../config.ts"
import { Router } from "oak";

/**
 * Initialise all API rest controllers
 */
export default function initApi(router: Router): void {
	Users.init(router, API_ROOT);
	Questions.init(router, API_ROOT);
	Answers.init(router, API_ROOT);
	Api.init(router, API_ROOT)
	Fallback.init(router)
}