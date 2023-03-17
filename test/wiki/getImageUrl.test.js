import wiki from '../../lib/wiki/index.js';
import { getImageUrl } from '../../lib/wiki/request.js';

const test_cases = [
    // 2016-03-04
    {
        filename: 'Fat Albert low level pass.jpg',
        pic_source: wiki.PIC_SOURCES.wikimedia_commons,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Fat_Albert_low_level_pass.jpg'
    },
    // 2017-01-23
    {
        filename: 'Winslow Homer - The Gulf Stream - Metropolitan Museum of Art.jpg',
        pic_source: wiki.PIC_SOURCES.wikipedia_en,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg'
    }
];

describe('Test getImageUrl() in wiki/request.js', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ wiki.SOURCE_NAMES[test_case.pic_source] }`, async () => {
            await expect(getImageUrl(test_case.filename, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
});
