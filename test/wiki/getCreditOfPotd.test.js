import { PIC_SOURCES, SOURCE_NAMES } from '../../lib/wiki/misc.js';
import { jest } from '@jest/globals'

const test_cases = [
    {
        date: '2009-07-27',
        pic_source: PIC_SOURCES.wikimedia_commons,
        expected: 'Credit: New York\xa0: Liebler &amp; Maass Lith.\nLicense: Public domain',
        stubbed_filename: 'Georges Bizet - Rosabel Morrison - Carmen poster.png',
        stubbed_credit: {
            artist: 'New York : Liebler &amp; Maass Lith.',
            license: 'Public domain',
            license_url: null
        }
    },
    {
        date: '2011-06-27',
        pic_source: PIC_SOURCES.wikipedia_en,
        expected: 'Credit: Waud, Alfred R. (Alfred Rudolph), 1828-1891\nLicense: Public domain',
        stubbed_filename: 'Kennesaw bombardment2.jpg',
        stubbed_credit: {
            artist: 'Waud, Alfred R. (Alfred Rudolph), 1828-1891',
            license: 'Public domain',
            license_url: null
        }
    },
    {
        date: '2023-03-15',
        pic_source: PIC_SOURCES.wikimedia_commons,
        expected: 'Credit: <a href="https://www.wikidata.org/wiki/Q28147777" class="extiw" title="d:Q28147777">Diego Delso</a>\n\nLicense: <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>',
        stubbed_filename: 'Cocodrilo del Nilo (Crocodylus niloticus), parque nacional de Chobe, Botsuana, 2018-07-28, DD 86.jpg',
        stubbed_credit: {
            artist: '<a href="https://www.wikidata.org/wiki/Q28147777" class="extiw" title="d:Q28147777">Diego Delso</a>\n',
            license: 'CC BY-SA 4.0',
            license_url: 'https://creativecommons.org/licenses/by-sa/4.0'
        }
    }
];

const mocked_getImageFileNameByDate = jest.fn()
const mocked_getImageCredit = jest.fn()

for (const test_case of test_cases) {
    mocked_getImageFileNameByDate.mockReturnValueOnce(test_case.stubbed_filename);
    mocked_getImageCredit.mockReturnValueOnce(test_case.stubbed_credit);
}

jest.unstable_mockModule('../../lib/wiki/request.js', () => ({
    getImageFileNameByDate: mocked_getImageFileNameByDate,
    getImageCredit: mocked_getImageCredit,
    getImageCaption: null,
    getImageUrl: null
}));

const { getCreditOfPotd } = await import('../../lib/wiki/potd.js');

describe('Test getCreditOfPotd() in wiki/potd.js', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ SOURCE_NAMES[test_case.pic_source] }`, async () => {
            await expect(getCreditOfPotd(test_case.date, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
})
