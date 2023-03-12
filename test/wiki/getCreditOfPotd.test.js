import { getCreditOfPotd, PIC_SOURCES } from '../../lib/wiki/index.js';

const srcs = {
    [PIC_SOURCES.wikimedia_commons]: 'commons.wikimedia.org',
    [PIC_SOURCES.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    {
        date: '2009-07-27',
        src: PIC_SOURCES.wikimedia_commons,
        expected: 'Credit: New York\xa0: Liebler &amp; Maass Lith.\nLicense: Public domain'
    },
    {
        date: '2011-06-27',
        src: PIC_SOURCES.wikipedia_en,
        expected: 'Credit: Waud, Alfred R. (Alfred Rudolph), 1828-1891\nLicense: Public domain'
    }
];

for (let test_case of test_cases) {
    test(`Test getCreditOfPotd() in wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getCreditOfPotd(test_case.date, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
