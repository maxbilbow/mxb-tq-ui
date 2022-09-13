// deno-lint-ignore-file no-explicit-any
import db from "../../../modules/db.ts";

export default function mockDb() {
    /**
     * Mock DB responses for isolated testing
     */
    db.query = (query: string): any => {
        if (query.startsWith('SELECT')) {
            return getQuestions()
        } else {
            return { affectedRows: 1, lastInsertId: 42 }
        }
    }

    function getQuestions(n = 3) {
        const questions = Array(n)
            .fill({ 
                created: new Date().toISOString()
            }).map((value, i) => {
                const id = value.id = i + 1
                value.title = `title${id}`
                value.summary = `summary${id}`
                value.body =  `# MD Title${id}\n\nAnd some text`
                value.answer_count = i
                value.author = `user${id}`
                value.created = `2022-05-0${id}T15:24:06.467Z`
                if (id === 3) {
                    value.resolution_id = 42
                }
                return {...value}
            })
            Object.assign(questions[0], {
                // Single user
                username: 'user1',
                password_hash: '$2b$10$gL33obKAFUT5DK3pEbh72OIHztsWBniBBh.PdeKOrF1yr5KFAsdZO',

                // SELECT COUNT(*)
                count: n
            })
        return questions
    }
}