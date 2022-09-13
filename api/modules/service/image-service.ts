import { existsSync } from "fs/exists";
import { Base64 } from 'bb64';
import db from '../db.ts'
import getLogger from "../../logger.ts";
const IMAGE_STORE_PATH = Deno.env.get('FAQ_IMAGE_STORE_PATH') ?? './spa'
const IMAGE_DOWNLOAD_PATH = Deno.env.get('FAQ_IMAGE_DOWNLOAD_PATH') ?? 'uploads/images/'
const logger = getLogger()
export async function saveImage(base64String: string, userId: number) {
    logger.info('save file')
    const [metadata, base64Image] = base64String.split(';base64,')
    logger.info(metadata)
    const extension = metadata.split('/').pop()
    logger.info(extension)
    const filename = `${userId}-${Date.now()}.${extension}`
    const { lastInsertId } = await db.query('INSERT INTO `media` (`filename`, `filetype`) VALUES (?, "image" )', [filename])
    Base64.fromBase64String(base64Image).toFile(`${IMAGE_STORE_PATH}${getImagePath(filename)}`)
    logger.info('file saved')
    return lastInsertId as number
}

export async function deleteImage(imageId: number): Promise<boolean> {
    const result: { filename: string }[] = await db.query('SELECT `filename` FROM `media` WHERE `id` = ? ', [imageId])
    const filename = result[0]?.filename as string | undefined
    const fileLocation = `${IMAGE_STORE_PATH}${getImagePath(filename)}`
    if (fileLocation && existsSync(fileLocation)) {
        Deno.removeSync(fileLocation)
    }
    const { affectedRows } = await db.query('DELETE FROM `media` WHERE `id` = ? ', [imageId])
    return affectedRows === 1
}

export function getImagePath(filename: string | undefined) {
    if (!filename) return undefined
    return `/${IMAGE_DOWNLOAD_PATH}/${filename}`
}