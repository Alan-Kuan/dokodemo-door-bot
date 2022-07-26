const { IMG_SRCS } = require('../../src/wiki');
const rewire = require('rewire');
const request = rewire('../../src/wiki/request.js');

const getImageFileNameOfDate = request.__get__('getImageFileNameOfDate');

const srcs = {
    [IMG_SRCS.wikimedia_commons]: 'commons.wikimedia.org',
    [IMG_SRCS.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    {
        src: IMG_SRCS.wikimedia_commons,
        date: '2010-06-09',
        expected: 'Roof hafez tomb.jpg'
    },
    {
        src: IMG_SRCS.wikipedia_en,
        date: '2010-08-01',
        expected: 'Pied Oystercatcher on beach.jpg'
    },
    {
        src: IMG_SRCS.wikipedia_en,
        date: '2022-07-25',
        expected: 'Lion\'s mane jellyfish in Gullmarn fjord at Sämstad 8 - edited.jpg'
    }
];

for (let test_case of test_cases) {
    test(`Test getImageFileNameOfDate() in src/wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getImageFileNameOfDate(test_case.date, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
