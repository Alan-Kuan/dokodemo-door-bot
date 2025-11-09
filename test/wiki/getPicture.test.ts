import { describe, test, expect } from 'vitest';

import { PicSource, SOURCE_NAMES } from '#types/index.js';
import { getPicture } from '#wiki/request.js';

const test_cases = [
    // 2016-03-04
    {
        filename: 'Fat Albert low level pass.jpg',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: {
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Fat_Albert_low_level_pass.jpg/1024px-Fat_Albert_low_level_pass.jpg',
            width: 1024,
            height: 683,
            size: 129692,
        },
    },
    // 2017-01-23
    {
        filename: 'Winslow Homer - The Gulf Stream - Metropolitan Museum of Art.jpg',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: {
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg/1024px-Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg',
            width: 1024,
            height: 616,
            size: 210825,
        },
    },
];

describe('Test getPicture() in wiki/request.ts', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ SOURCE_NAMES.get(test_case.pic_source) }`, async () => {
            await expect(getPicture(test_case.filename, test_case.pic_source))
                .resolves.toStrictEqual(test_case.expected);
        });
    }
});
