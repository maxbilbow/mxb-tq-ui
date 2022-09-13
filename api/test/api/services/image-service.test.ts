// deno-lint-ignore-file no-unused-vars
import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    beforeAll,
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";

import {
    assertSpyCall,
    Stub,
} from "https://deno.land/std@0.136.0/testing/mock.ts";
import { fileExists } from "../../../modules/util.ts";
import mockDb from '../../helpers/mock-db.ts';
Deno.env.set('FAQ_IMAGE_STORE_PATH', './.tmp/media')
Deno.env.set('FAQ_IMAGE_DOWNLOAD_PATH', 'images')
const imagePath = './.tmp/media/images'
const ImageService = await import('../../../modules/service/image-service.ts')

Deno.test('getImagePath returns the correct path', { sanitizeOps: false }, () => {
    assertEquals(ImageService.getImagePath('filename'), '/images/filename')
})

Deno.test('When filename is falsey Then getImagePath returns udefined', { sanitizeOps: false }, () => {
    assertEquals(ImageService.getImagePath(''), undefined)
})

const username = 'user'
const timestamp = 1234
const imageData = 'image/png;base64,'
const filename = `${username}-${timestamp}.png`
const filePath = `${imagePath}/${filename}`
const lastInsertId = 42

// deno-lint-ignore no-explicit-any
async function mockNow(cb: () => Promise<any>) {
    const now = Date.now
    Date.now = () => timestamp
    const res = await cb()
    Date.now = now
    return res
}

describe('When an an image is uploaded', { sanitizeOps: false }, () => {
    let response: number
    let queryStub: Stub
    beforeAll(async () => {
        Deno.mkdirSync(imagePath, { recursive: true })
        queryStub = mockDb.resolvesNext([{ lastInsertId }])
        response = await mockNow(() => ImageService.saveImage(imageData, 1))
    })

    it('Then the file was saved on the store location', () => {
        assert(fileExists(filePath), 'file not found')
    })

    it('Then the file was saved on the database', { ignore: true }, () => {
        assertSpyCall(queryStub, 0, { args: ['INSERT INTO `media` (`filename`, `filetype`) VALUES (?, "image" )', [filename]] })
    })
})