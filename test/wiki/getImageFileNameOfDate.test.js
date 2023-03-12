import { PIC_SOURCES } from '../../lib/wiki/index.js';
import rewire from 'rewire';
const request = rewire('../../lib/wiki/request.js');

const getImageFileNameOfDate = request.__get__('getImageFileNameOfDate');

const srcs = {
    [PIC_SOURCES.wikimedia_commons]: 'commons.wikimedia.org',
    [PIC_SOURCES.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    {
        src: PIC_SOURCES.wikimedia_commons,
        date: '2010-06-09',
        expected: 'Roof hafez tomb.jpg'
    },
    {
        src: PIC_SOURCES.wikipedia_en,
        date: '2010-08-01',
        expected: 'Pied Oystercatcher on beach.jpg'
    },
    {
        src: PIC_SOURCES.wikipedia_en,
        date: '2022-07-25',
        expected: 'Lion\'s mane jellyfish in Gullmarn fjord at Sämstad 8 - edited.jpg'
    }
];

for (let test_case of test_cases) {
    test(`Test getImageFileNameOfDate() in wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getImageFileNameOfDate(test_case.date, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
