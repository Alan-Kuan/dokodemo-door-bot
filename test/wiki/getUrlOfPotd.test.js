import { getUrlOfPotd, PIC_SOURCES } from '../../lib/wiki/index.js';

const srcs = {
    [PIC_SOURCES.wikimedia_commons]: 'commons.wikimedia.org',
    [PIC_SOURCES.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    {
        date: '2011-02-28',
        src: PIC_SOURCES.wikimedia_commons,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Lambis_millepeda_01.jpg/1024px-Lambis_millepeda_01.jpg',
    },
    {
        date: '2018-05-09',
        src: PIC_SOURCES.wikipedia_en,
        expected: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Salarom_Sabah_Frame-of-a-new-house-01.jpg/1024px-Salarom_Sabah_Frame-of-a-new-house-01.jpg',
    }
];

for (let test_case of test_cases) {
    test(`Test getUrlOfPotd() in wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getUrlOfPotd(test_case.date, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
