const rewire = require('rewire');
const wiki = rewire('../../src/wiki.js');

const getImageUrl = wiki.__get__('getImageUrl');

const srcs = {
    'c': 'commons.wikimedia.org',
    'e': 'en.wikipedia.org'
};

const test_cases = [{
        src: wiki.IMG_SRCS.wikimedia_commons,
        title: '{{Potd/2016-03-04}}',
        expected: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Fat_Albert_low_level_pass.jpg'
    },
    {
        src: wiki.IMG_SRCS.wikipedia_en,
        title: '{{POTD/2017-01-23|image}}',
        expected: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg'
    }];

for(let test_case of test_cases) {
    test(`Test getImageUrl() in src/wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getImageUrl(test_case.title, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
