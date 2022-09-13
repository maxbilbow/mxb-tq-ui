
/* register.js */

import AppNavigator from '../framework/app-navigator.js'
import Notifications from '../framework/notifications.js'
import Api from '../service/api.service.js'
import setTitleArea from './layout/set-title-area.js'
import type { UserRegistrationRequest } from '../../generated/UserRegistrationRequest'
import ViewBuilder from '../framework/view-builder.js'
import getLogger from '../framework/logger.js'

const logger = getLogger()
export const setup: ViewBuilder = async (node) => {
	logger.debug('REGISTER: setup')
	setTitleArea('Register an Account')
	node.querySelector('form')?.addEventListener('submit', await register)
}

async function register(event: SubmitEvent) {
	event.preventDefault()
	const formData = new FormData(event.target as HTMLFormElement)
	const data = Object.fromEntries(formData.entries())
	logger.debug(data)
	try {
		const response = await Api.post('/users', {
			data: {
				id: '',
				type: 'users',
				attributes: {
					username: data.user,
					password: data.pass
				}
			}
		} as UserRegistrationRequest)
		logger.debug(response)
		Notifications.notify('new account registered')
		AppNavigator.replace('login')
	} catch (e) {
		Notifications.error((e as Error).message)
	}
}