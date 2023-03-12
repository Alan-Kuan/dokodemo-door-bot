import { PIC_SOURCES } from '../../lib/wiki/index.js';
import rewire from 'rewire';
const request = rewire('../../lib/wiki/request.js');

const getImageCredit = request.__get__('getImageCredit');

const srcs = {
    [PIC_SOURCES.wikimedia_commons]: 'commons.wikimedia.org',
    [PIC_SOURCES.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    // 2022-03-04
    {
        src: PIC_SOURCES.wikimedia_commons,
        filename: 'View from McQueen Pass towards Lyttelton Harbour, New Zealand.jpg',
        expected: {
            artist: '<a href="//commons.wikimedia.org/wiki/User:Podzemnik" title="User:Podzemnik">Michal Klajban</a>',
            license: 'CC BY-SA 4.0',
            license_url: 'https://creativecommons.org/licenses/by-sa/4.0'
        }
    },
    // 2013-09-25
    {
        src: PIC_SOURCES.wikipedia_en,
        filename: 'Sterna nereis - Little Swanport.jpg',
        expected: {
            artist: '<a href="//commons.wikimedia.org/wiki/User:JJ_Harrison" title="User:JJ Harrison">JJ Harrison</a> (<a rel="nofollow" class="external free" href="https://www.jjharrison.com.au/">https://www.jjharrison.com.au/</a>)',
            license: 'CC BY-SA 3.0',
            license_url: 'https://creativecommons.org/licenses/by-sa/3.0'
        }
    }
];

for(let test_case of test_cases) {
    test(`Test getImageCredit() in wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getImageCredit(test_case.filename, test_case.src))
            .resolves.toEqual(test_case.expected);
    });
}
