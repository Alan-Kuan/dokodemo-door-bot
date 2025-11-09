import { describe, test, expect } from 'vitest';

import { PicSource, SOURCE_NAMES } from '#types/index.js';
import { getFilenamesByDate } from '#wiki/request.js';

const test_cases = [
    {
        date: '2010-06-09',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: ['Roof_hafez_tomb.jpg'],
    },
    {
        date: '2010-08-01',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: [
            'Pied_Oystercatcher_on_beach.jpg',
            // NOTE: this image is not one of the pictures of the day,
            // but I don't have a way to eliminate it currently
            'Eagle_01.svg',
        ],
    },
    {
        date: '2022-07-25',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: [
            "Lion's_mane_jellyfish_in_Gullmarn_fjord_at_Sämstad_8_-_edited.jpg",
            "Lion's_mane_jellyfish_in_Gullmarn_fjord_at_Sämstad_3.jpg",
        ],
    },
    {
        date: '2025-08-30',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: [
            'Mandel_zoom_00_mandelbrot_set.jpg',
            'Mandel_zoom_01_head_and_shoulder.jpg',
            'Mandel_zoom_02_seehorse_valley.jpg',
            'Mandel_zoom_03_seehorse.jpg',
            'Mandel_zoom_04_seehorse_tail.jpg',
            'Mandel_zoom_05_tail_part.jpg'
        ],
    },
];

describe('Test getFilenamesByDate() in wiki/request.ts', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ SOURCE_NAMES.get(test_case.pic_source) }`, async () => {
            await expect(getFilenamesByDate(test_case.date, test_case.pic_source))
                .resolves.toStrictEqual(test_case.expected);
        });
    }
});
