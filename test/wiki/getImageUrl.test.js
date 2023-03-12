import { PIC_SOURCES } from '../../lib/wiki/index.js';
import rewire from 'rewire';
const request = rewire('../../lib/wiki/request.js');

const getImageUrl = request.__get__('getImageUrl');

const srcs = {
    [PIC_SOURCES.wikimedia_commons]: 'commons.wikimedia.org',
    [PIC_SOURCES.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    // 2016-03-04
    {
        src: PIC_SOURCES.wikimedia_commons,
        filename: 'Fat Albert low level pass.jpg',
        expected: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Fat_Albert_low_level_pass.jpg'
    },
    // 2017-01-23
    {
        src: PIC_SOURCES.wikipedia_en,
        filename: 'Winslow Homer - The Gulf Stream - Metropolitan Museum of Art.jpg',
        expected: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg'
    }
];

for (let test_case of test_cases) {
    test(`Test getImageUrl() in wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getImageUrl(test_case.filename, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
