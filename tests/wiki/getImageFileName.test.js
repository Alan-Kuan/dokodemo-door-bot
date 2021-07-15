const rewire = require('rewire');
const wiki = rewire('../../src/wiki.js');

const getImageFileName = wiki.__get__('getImageFileName');

const srcs = {
    'c': 'commons.wikimedia.org',
    'e': 'en.wikipedia.org'
};

const test_cases = [{
        src: wiki.IMG_SRCS.wikimedia_commons,
        title: '{{Potd/2010-06-09}}',
        expected: 'Roof hafez tomb.jpg'
    },
    {
        src: wiki.IMG_SRCS.wikipedia_en,
        title: '{{POTD/2010-08-01|image}}',
        expected: 'Pied Oystercatcher on beach.jpg'
    }];

for(let test_case of test_cases) {
    test(`Test getImageFileName() in src/wiki.js with source of ${ srcs[test_case.src] }`, async () => {
        let actual = await getImageFileName(test_case.title, test_case.src);
        expect(actual).toBe(test_case.expected);
    });
}
