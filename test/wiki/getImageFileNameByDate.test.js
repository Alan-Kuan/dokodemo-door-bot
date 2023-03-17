import wiki from '../../lib/wiki/index.js';
import { getImageFileNameByDate } from '../../lib/wiki/request.js';

const test_cases = [
    {
        date: '2010-06-09',
        pic_source: wiki.PIC_SOURCES.wikimedia_commons,
        expected: 'Roof hafez tomb.jpg'
    },
    {
        date: '2010-08-01',
        pic_source: wiki.PIC_SOURCES.wikipedia_en,
        expected: 'Pied Oystercatcher on beach.jpg'
    },
    {
        date: '2022-07-25',
        pic_source: wiki.PIC_SOURCES.wikipedia_en,
        expected: 'Lion\'s mane jellyfish in Gullmarn fjord at Sämstad 8 - edited.jpg'
    }
];

describe('Test getImageFileNameByDate() in wiki/request.js', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ wiki.SOURCE_NAMES[test_case.pic_source] }`, async () => {
            await expect(getImageFileNameByDate(test_case.date, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
});
