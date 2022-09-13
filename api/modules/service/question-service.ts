import type { Question } from "../../generated/Question.d.ts"
import { BadDataError, NotFoundError } from '../errors.ts'
import db from '../db.ts'
import type { QuestionCreate } from '../../generated/QuestionCreate.d.ts'
import type { QuestionUpdate } from '../../generated/QuestionUpdate.d.ts'
import { Marked } from 'markdown'
import { deleteImage, getImagePath, saveImage } from "./image-service.ts";
import getLogger from "../../logger.ts";

const logger = getLogger()

export default class QuestionServcie {
    async get(id: number): Promise<Question> {
        const records: Record<string, string | number>[] = await db.query(
            'SELECT q.`id`, `created`, `title`, `summary`, `resolution_id`,'
            + ' `lon`, `lat`, l.`name` as "location_name", `username` as "author",'
            + ' `image_id`, m.`filename` as image_filename, `body`, GROUP_CONCAT(k.text) AS "keywords",'
            + ' (SELECT COUNT(*) FROM `answers` a WHERE a.question_id = q.id) as answer_count'
            + ' FROM `questions` q'
            + ' LEFT JOIN `media` m ON q.image_id = m.id'
            + ' LEFT JOIN `users` u ON q.user_id = u.id'
            + ' LEFT JOIN `locations` l ON q.location_id = l.id'
            + ' JOIN `question_keywords` qk ON qk.question_id = q.id'
            + ' JOIN `keywords` k ON k.id = qk.keyword_id'
            + ' WHERE q.id = ?', [id]);

        logger.info(records)
        if (!records[0]) throw new NotFoundError();
        return recordToQuestion(records[0]);
    }

    async create(question: QuestionCreate, userId: number): Promise<number> {
        const locationId = null;
        let imageId: number | null = null;
        if (question.image) {
            imageId = await saveImage(question.image, userId)
        }
        const { affectedRows, lastInsertId } = await db.query("INSERT INTO `questions`"
            + " (`user_id`, `title`, `summary`, `body`, `location_id`, `image_id`)"
            + " VALUES (?, ?, ?, ?, ?, ?)", [userId, question.title, question.summary, question.body.text, locationId, imageId])


        if (affectedRows !== 1) {
            throw new BadDataError('Failed to insert question');
        }
        return lastInsertId;
    }

    async update(id: number, question: QuestionUpdate, userId: number) {
        let imageId: number | null = await this.getCurrentImageId(id)
        if (imageId !== null && question.image === '' && await deleteImage(imageId)) {
            imageId = null
        } else if (question.image?.length && (imageId === null || await deleteImage(imageId))) {
            imageId = await saveImage(question.image, userId)
        }
        const { affectedRows } = await db.query("UPDATE `questions`"
            + " SET `title` = ?, `summary` = ?, `body` = ?, `image_id` = ?"
            + " WHERE `id` = ?", [question.title, question.summary, question.body.text, imageId, id])


        if (affectedRows !== 1) {
            throw new BadDataError(`Failed to update question ${id}`);
        }
    }

    async setResolved(questionId: string, resolved: boolean, answerId: number | undefined, userId: number) {
        if (resolved) {
            await db.query(
                'UPDATE `questions` SET `resolution_id` = ?'
                + ' WHERE `id` = ? AND `user_id` = ?',
                [answerId, questionId, userId]);
        } else {
            await db.query(
                'UPDATE `questions` SET `resolution_id` = NULL'
                + ' WHERE `id` = ? AND `user_id` = ?',
                [questionId, userId]);
        }
    }

    async delete(questionId: number, userId: number) {
        await db.query('DELETE l'
            + ' FROM `questions` q'
            + ' LEFT JOIN `locations` l'
            + ' ON q.location_id = l.id'
            + ' WHERE q.id = ? AND `user_id` = ?', [questionId, userId]);
        await db.query('DELETE FROM `questions`'
            + ' WHERE `id` = ? AND `user_id` = ?', [questionId, userId]);
    }

    private async getCurrentImageId(questonId: number) {
        const result: { image_id: number }[] = await db.query('SELECT `image_id` FROM `questions` WHERE `id` = ?', [questonId])
        return result[0].image_id ?? null as number | null
    }
}

function recordToQuestion(record: Record<string, string | number>): Question {
    const location = record.location_name ? {
        longitude: record.lon as number,
        latitude: record.lat as number,
        displayName: record.location_name as string
    } : undefined
    const resource: Question = {
        id: record.id as number,
        created: Date.parse(record.created as string),
        author: record.author as string,
        title: record.title as string,
        summary: record.summary as string,
        body: {
            text: record.body as string,
            html: Marked.parse(record.body as string).content
        },
        resolutionId: record.resolution_id as number,
        location,
        imageId: record.image_id as number,
        imageUrl: getImagePath(record.image_filename as string | undefined),
        keywords: [],
        answerCount: record.answer_count as number
    }
    return resource;
}

