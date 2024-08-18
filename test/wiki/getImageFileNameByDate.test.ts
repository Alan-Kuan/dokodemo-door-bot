import { describe, test, expect } from '@jest/globals';

import { PicSource, SOURCE_NAMES } from '#wiki/misc.js';
import { getImageFileNameByDate } from '#wiki/request.js';

const test_cases = [
    {
        date: '2010-06-09',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: 'Roof hafez tomb.jpg'
    },
    {
        date: '2010-08-01',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: 'Pied Oystercatcher on beach.jpg'
    },
    {
        date: '2022-07-25',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: 'Lion\'s mane jellyfish in Gullmarn fjord at Sämstad 8 - edited.jpg'
    }
];

describe('Test getImageFileNameByDate() in wiki/request.ts', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ SOURCE_NAMES[test_case.pic_source] }`, async () => {
            await expect(getImageFileNameByDate(test_case.date, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
});
