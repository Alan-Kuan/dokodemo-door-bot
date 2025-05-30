import { describe, test, expect, vi } from 'vitest';

import { PicSource, SOURCE_NAMES } from '#types/index.js';
import { getCreditOfPotd } from '#wiki/potd.js';

const test_cases = [
    {
        date: '2009-07-27',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: '<b>Credit:</b> New York\xa0: Liebler &amp; Maass Lith.\n<b>License:</b> Public domain',
        stubbed_filename: 'Georges Bizet - Rosabel Morrison - Carmen poster.png',
        stubbed_credit: {
            artist: 'New York : Liebler &amp; Maass Lith.',
            license: 'Public domain',
            license_url: null
        }
    },
    {
        date: '2011-06-27',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: '<b>Credit:</b> Waud, Alfred R. (Alfred Rudolph), 1828-1891\n<b>License:</b> Public domain',
        stubbed_filename: 'Kennesaw bombardment2.jpg',
        stubbed_credit: {
            artist: 'Waud, Alfred R. (Alfred Rudolph), 1828-1891',
            license: 'Public domain',
            license_url: null
        }
    },
    {
        date: '2023-03-15',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: '<b>Credit:</b> <a href="https://www.wikidata.org/wiki/Q28147777" class="extiw" title="d:Q28147777">Diego Delso</a>\n\n<b>License:</b> <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>',
        stubbed_filename: 'Cocodrilo del Nilo (Crocodylus niloticus), parque nacional de Chobe, Botsuana, 2018-07-28, DD 86.jpg',
        stubbed_credit: {
            artist: '<a href="https://www.wikidata.org/wiki/Q28147777" class="extiw" title="d:Q28147777">Diego Delso</a>\n',
            license: 'CC BY-SA 4.0',
            license_url: 'https://creativecommons.org/licenses/by-sa/4.0'
        }
    }
];

vi.mock('#wiki/request', () => ({
    getImageFileNameByDate: vi.fn(),
    getImageCredit: vi.fn(),
}));

import { getImageFileNameByDate, getImageCredit } from '#wiki/request.js';

describe('Test getCreditOfPotd() in wiki/potd.ts', () => {
    for (const test_case of test_cases) {
        vi.mocked(getImageFileNameByDate).mockResolvedValueOnce(test_case.stubbed_filename);
        vi.mocked(getImageCredit).mockResolvedValueOnce(test_case.stubbed_credit);

        test(`pic_source = ${ SOURCE_NAMES.get(test_case.pic_source) }`, async () => {
            await expect(getCreditOfPotd(test_case.date, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
});
