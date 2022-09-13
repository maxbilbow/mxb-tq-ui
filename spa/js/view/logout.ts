
/* logout.js */

import * as AppState from '../framework/app-state.js'
import AppNavigator from '../framework/app-navigator.js'
import Notifications from '../framework/notifications.js'
import ViewBuilder from '../framework/view-builder.js'
import getLogger from '../framework/logger.js'

const logger = getLogger()
export const setup: ViewBuilder = async (node) => {
	logger.debug('LOGOUT: setup')
	node.querySelectorAll('button').forEach(button => button.addEventListener('click', event => {
		logger.debug((event.target as HTMLElement).innerText)
		if ((event.target as HTMLElement).innerText === 'OK') {
			AppState.clear()
			AppNavigator.replace('login')
			Notifications.notify('you are logged out')
		} else {
			AppNavigator.pop()
		}
	}))
}
