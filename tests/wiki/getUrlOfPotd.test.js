const { getUrlOfPotd, IMG_SRCS } = require('../../src/wiki.js');

const srcs = {
    'c': 'commons.wikimedia.org',
    'e': 'en.wikipedia.org'
};

const test_cases = [{
        date: '2011-02-28',
        src: IMG_SRCS.wikimedia_commons,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Lambis_millepeda_01.jpg/1024px-Lambis_millepeda_01.jpg',
    },
    {
        date: '2018-05-09',
        src: IMG_SRCS.wikipedia_en,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Salarom_Sabah_Frame-of-a-new-house-01.jpg/1024px-Salarom_Sabah_Frame-of-a-new-house-01.jpg',
    }];

for(let test_case of test_cases) {
    test(`Test getUrlOfPotd() in src/wiki.js with source of ${ srcs[test_case.src] }`, async () => {
        let actual = await getUrlOfPotd(test_case.date, test_case.src);
        expect(actual).toBe(test_case.expected);
    });
}
