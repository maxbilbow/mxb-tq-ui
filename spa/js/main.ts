import './elements/index.js'
import onPullDown from './framework/on-pull-down.js'
import registerWorkers from './register-workers.js'

/**
 * Implement pull to refresh behaviour for PWA
 */
onPullDown(() => location.reload())

await registerWorkers()