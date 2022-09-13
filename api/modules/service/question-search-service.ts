import type { QuestionSearchItem } from '../../generated/QuestionSearchItem.d.ts'
import db from '../db.ts'
export default class QuestionSearchServcie {

    async search(q: string, limit: number, offset: number): Promise<QuestionSearchItem[]> {
        let condition = '1';
        const args = [limit, offset] as unknown[];
        if (q) {
            condition = 'q.`title` LIKE ?'
            args.unshift(`%${q}%`)
        }
        const records: Record<string, string | number>[] = await db.query('SELECT q.`id`, `created`, `title`, `summary`, `resolution_id`, `image_id`,'
            + ' `lon`, `lat`, l.`name` as "location_name", `username` as "author",'
            + ' (SELECT COUNT(*) FROM `answers` a WHERE a.question_id = q.id) as answer_count'
            + ' FROM `questions` q'
            + ' LEFT JOIN `users` u ON q.user_id = u.id'
            + ' LEFT JOIN `locations` l ON q.location_id = l.id'
            + ` WHERE ${condition}`
            + ' ORDER BY q.created DESC'
            + ` LIMIT ? OFFSET ?`, args);

        return records.map(recordToQuestion);
    }


    async getTotal(q: string) {
        let condition = '1';
        const args = [] as string[];
        if (q) {
            condition = 'q.`title` LIKE ?'
            args.unshift(q)
        }
        const [res] = (await db.query('SELECT COUNT(*) as "total"'
            + ' FROM `questions` q'
            + ' LEFT JOIN `users` u ON q.user_id = u.id'
            + ' LEFT JOIN `locations` l ON q.location_id = l.id'
            + ` WHERE ${condition}`, args))
        return res.total as number
    }
}

function recordToQuestion(record: Record<string, string | number>): QuestionSearchItem {
    const location = record.location_name ? {
        longitude: record.lon as number,
        latitude: record.lat as number,
        displayName: record.location_name as string
    } : undefined
    const attributes: QuestionSearchItem = {
        id: record.id as number,
        created: Date.parse(record.created as string),
        author: record.author as string,
        title: record.title as string,
        summary: record.summary as string,
        resolutionId: record.resolution_id as number,
        location,
        keywords: [],
        answerCount: record.answer_count as number
    };
    return attributes
}
