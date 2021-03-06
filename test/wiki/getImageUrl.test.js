const { IMG_SRCS } = require('../../src/wiki');
const rewire = require('rewire');
const request = rewire('../../src/wiki/request.js');

const getImageUrl = request.__get__('getImageUrl');

const srcs = {
    [IMG_SRCS.wikimedia_commons]: 'commons.wikimedia.org',
    [IMG_SRCS.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    // 2016-03-04
    {
        src: IMG_SRCS.wikimedia_commons,
        filename: 'Fat Albert low level pass.jpg',
        expected: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Fat_Albert_low_level_pass.jpg'
    },
    // 2017-01-23
    {
        src: IMG_SRCS.wikipedia_en,
        filename: 'Winslow Homer - The Gulf Stream - Metropolitan Museum of Art.jpg',
        expected: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg'
    }
];

for (let test_case of test_cases) {
    test(`Test getImageUrl() in src/wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getImageUrl(test_case.filename, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
