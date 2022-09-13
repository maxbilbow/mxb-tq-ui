import * as AppState from '../framework/app-state.js'
import setTitleArea from './layout/set-title-area.js'
import AppNavigator from '../framework/app-navigator.js'
import Api from '../service/api.service.js'
import type { UserResponse } from '../../generated/UserResponse'
import type { ErrorResponse } from '../../generated/ErrorResponse.js'
import Notifications from '../framework/notifications.js'
import ViewBuilder from '../framework/view-builder.js'
import getLogger from '../framework/logger.js'

const logger = getLogger()
export const setup: ViewBuilder = async (node) => {
	logger.debug('LOGIN: setup')
	setTitleArea('Login Page')
	node.querySelector<HTMLFormElement>('form')?.addEventListener('submit', login)
}

async function login(event: SubmitEvent) {
	event.preventDefault()
	logger.debug('form submitted')
	const formData = new FormData(event.target as HTMLFormElement)
	const { user, pass } = Object.fromEntries(formData.entries())
	const token = 'Basic ' + btoa(`${user}:${pass}`)
	logger.debug('making call to secureGet')
	try {
		AppState.set('authorization', token)
		const { data }: UserResponse = await Api.get('/users', { secure: true })
		AppState.set('username', (user as string).toLowerCase())
		Notifications.notify(`you are logged in as ${data.id}`)
		return AppNavigator.replace('')
	} catch (e) {
		AppState.remove('username')
		AppState.remove('authorization')
		if (e && typeof e === 'object' && Object.keys(e).includes('errors')) {
			const response = e as ErrorResponse
			const input = document.querySelector<HTMLInputElement>('input[name="pass"]')
			if (input) {
				input.value = ''
			}
			Notifications.warn(response.errors[0].detail)
		} else {
			Notifications.error('Login failed')
			logger.error('Login error!', e)
		}
	}
}
