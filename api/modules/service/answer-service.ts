import { BadDataError } from '../errors.ts'

import type { AnswerCreate } from '../../generated/AnswerCreate.d.ts'
import type { AnswerUpdate } from '../../generated/AnswerUpdate.d.ts'

import type { Answer } from '../../generated/Answer.d.ts';
import { Marked } from "markdown";
import db from '../db.ts'

const SQL_SELECT_ANSWER = 'SELECT a.`id`, `created`,'
    + ' `lon`, `lat`, l.`name` as "location_name", `username` as "author", `body`'
    + ' FROM `answers` a'
    + ' LEFT JOIN `users` u ON a.user_id = u.id'
    + ' LEFT JOIN `locations` l ON a.location_id = l.id';

const SQL_SELECT_FOR_QEUSTION = SQL_SELECT_ANSWER + ' WHERE a.question_id = ?';
const SQL_SELECT_BY_ID = SQL_SELECT_FOR_QEUSTION + ' AND a.id = ?';

export default class AnswerServcie {

    async getForQuestion(questionId: number | string): Promise<Answer[]> {
        const records: Record<string, string | number>[] = await db.query(SQL_SELECT_FOR_QEUSTION, [+questionId]);

        return records.map(recordToAnswer);
    }

    async get(questionId: number, answerId: number): Promise<Answer> {
        const records: Record<string, string | number>[] = await db.query(SQL_SELECT_BY_ID, [questionId, answerId]);
        return recordToAnswer(records[0])
    }

    async create(questionId: number, answer: AnswerCreate, userId: number) {
        const locationId = null
        const { affectedRows, lastInsertId } = await db.query("INSERT INTO `answers`"
            + " (`question_id`, `user_id`, `body`, `location_id`)"
            + " VALUES (?, ?, ?, ?)",
            [questionId, userId, answer.body, locationId])

        if (affectedRows !== 1) {
            throw new BadDataError(`Failed to insert answer for question ${questionId}`);
        }
        return lastInsertId
    }

    async update(questionId: number, answerId: number, answer: AnswerUpdate, userId: number) {
        const { affectedRows } = await db.query("UPDATE `answers` SET `body` = ? WHERE `id` = ? AND `user_id` = ? AND `question_id` = ?", [answer.body, answerId, userId, questionId])

        if (affectedRows !== 1) {
            throw new BadDataError(`Failed to update answer ${answerId}`);
        }
    }

    async delete(questionId: number, answerId: number, userId: number) {
        await db.query('DELETE l'
            + ' FROM `answers` a'
            + ' INNER JOIN `locations` l'
            + ' ON a.location_id = l.id'
            + ' WHERE a.id = ? AND `user_id` = ? AND `question_id` = ?', [answerId, userId, questionId]);
        await db.query('DELETE FROM `answers`'
            + ' WHERE `id` = ? AND `user_id` = ?', [answerId, userId]);
    }
}

function recordToAnswer(record: Record<string, string | number>): Answer {
    const location = record.location_name ? {
        longitude: record.lon as number,
        latitude: record.lat as number,
        displayName: record.location_name as string
    } : undefined
    const resource: Answer = {
        id: record.id as number,
        created: Date.parse(record.created as string),
        author: record.author as string,
        body: {
            text: record.body as string,
            html: Marked.parse(record.body as string).content
        },
        location
    }
    return resource;
}
