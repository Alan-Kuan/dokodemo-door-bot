import { PIC_SOURCES, SOURCE_NAMES } from '../../lib/wiki/misc.js';
import { jest } from '@jest/globals';

const test_cases = [
    {
        date: '2011-02-28',
        pic_source: PIC_SOURCES.wikimedia_commons,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Lambis_millepeda_01.jpg/1024px-Lambis_millepeda_01.jpg',
        stubbed_filename: 'Lambis millepeda 01.jpg',
        stubbed_image_url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Lambis_millepeda_01.jpg',
    },
    {
        date: '2018-05-09',
        pic_source: PIC_SOURCES.wikipedia_en,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Salarom_Sabah_Frame-of-a-new-house-01.jpg/1024px-Salarom_Sabah_Frame-of-a-new-house-01.jpg',
        stubbed_filename: 'Salarom Sabah Frame-of-a-new-house-01.jpg',
        stubbed_image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Salarom_Sabah_Frame-of-a-new-house-01.jpg',
    }
];

const mocked_getImageFileNameByDate = jest.fn()
const mocked_getImageUrl = jest.fn()

for (const test_case of test_cases) {
    mocked_getImageFileNameByDate.mockReturnValueOnce(test_case.stubbed_filename);
    mocked_getImageUrl.mockReturnValueOnce(test_case.stubbed_image_url);
}

jest.unstable_mockModule('../../lib/wiki/request.js', () => ({
    getImageFileNameByDate: mocked_getImageFileNameByDate,
    getImageUrl: mocked_getImageUrl,
    getImageCredit: null,
    getImageCaption: null
}));

const { getUrlOfPotd } = await import('../../lib/wiki/potd.js');

describe('Test getUrlOfPotd() in wiki/potd.js', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ SOURCE_NAMES[test_case.pic_source] }`, async () => {
            await expect(getUrlOfPotd(test_case.date, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
});
