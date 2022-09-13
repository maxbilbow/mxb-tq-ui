export type Logger = Console

/**
 * Avoid using console directly for logging (best practice)
 */
export default function getLogger(): Pick<Console, 'info' | 'debug' | 'warn' | 'error'> {
    return console
}