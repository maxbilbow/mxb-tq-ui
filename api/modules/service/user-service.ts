
/* accounts.js */

import { compare, genSalt, hash } from 'bcrypt'
import db from '../db.ts'
import type { UserRegistration } from '../../generated/UserRegistration.d.ts'
import { BadDataError } from "../errors.ts";
import getLogger from "../../logger.ts";

const logger = getLogger()

const saltRounds = 10
export const salt = await genSalt(saltRounds)

export async function login(credentials: UserRegistration) {
	const { username, password } = credentials
	let sql = 'SELECT count(id) AS count FROM `users` WHERE `username` = ?'
	const [res]: {count: number}[] = await db.query(sql, [username])
	if (!res.count) throw new Error(`username "${username}" not found`)
	sql = 'SELECT `password_hash` FROM `users` WHERE `username` = ?'
	const records: {username: string, password_hash: string}[] = await db.query(sql, [username])
	logger.info(records)
	const valid = await compare(password, records[0].password_hash)
	if (valid === false) throw new Error(`invalid password for account "${username}"`)
	return username
}

export async function register(credentials: UserRegistration) {
	if (!credentials.username) throw new BadDataError('Username not provided')
	if (!credentials.password) throw new BadDataError('Password not valid')
	const passwordHash = await hash(credentials.password, salt)
	const sql = `INSERT INTO users(username, password_hash) VALUES(?, ?)`
	logger.info(sql)
	await db.query(sql, [credentials.username, passwordHash]);
	return credentials.username
}

export async function getUserId(username: string) {
	const result: {id: number}[] = await db.query('SELECT id FROM `users` WHERE username = ?', [username])
	return result[0].id;
}