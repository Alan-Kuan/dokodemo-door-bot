import { describe, test, expect, vi } from 'vitest';

import { PicSource, SOURCE_NAMES } from '#types/index.js';
import { getUrlOfPotd } from '#wiki/potd.js';

const test_cases = [
    {
        date: '2011-02-28',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Lambis_millepeda_01.jpg/1024px-Lambis_millepeda_01.jpg',
        stubbed_filename: 'Lambis millepeda 01.jpg',
        stubbed_image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Lambis_millepeda_01.jpg',
    },
    {
        date: '2018-05-09',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Salarom_Sabah_Frame-of-a-new-house-01.jpg/1024px-Salarom_Sabah_Frame-of-a-new-house-01.jpg',
        stubbed_filename: 'Salarom Sabah Frame-of-a-new-house-01.jpg',
        stubbed_image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Salarom_Sabah_Frame-of-a-new-house-01.jpg',
    },
    {
        date: '2023-07-09',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Armoiries_de_Mar%C3%ADa_Margarita_Vargas_Santaella.svg/1024px-Armoiries_de_Mar%C3%ADa_Margarita_Vargas_Santaella.svg.png',
        stubbed_filename: 'Armoiries de María Margarita Vargas Santaella.svg',
        stubbed_image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Armoiries_de_Mar%C3%ADa_Margarita_Vargas_Santaella.svg',
    }
];

vi.mock('#wiki/request', () => ({
    getImageFileNameByDate: vi.fn(),
    getImageUrl: vi.fn(),
}));

import { getImageFileNameByDate, getImageUrl } from '#wiki/request.js';

describe('Test getUrlOfPotd() in wiki/potd.ts', () => {
    for (const test_case of test_cases) {
        vi.mocked(getImageFileNameByDate).mockResolvedValueOnce(test_case.stubbed_filename);
        vi.mocked(getImageUrl).mockResolvedValueOnce(test_case.stubbed_image_url);

        test(`pic_source = ${ SOURCE_NAMES.get(test_case.pic_source) }`, async () => {
            await expect(getUrlOfPotd(test_case.date, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
});
