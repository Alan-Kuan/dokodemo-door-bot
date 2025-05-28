import { describe, test, expect } from 'vitest';

import { PicSource, SOURCE_NAMES } from '#types/index.js';
import { getImageCredit } from '#wiki/request.js';

const test_cases = [
    // 2022-03-04
    {
        filename: 'View from McQueen Pass towards Lyttelton Harbour, New Zealand.jpg',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: {
            artist: '<a href="//commons.wikimedia.org/wiki/User:Podzemnik" title="User:Podzemnik">Michal Klajban</a>',
            license: 'CC BY-SA 4.0',
            license_url: 'https://creativecommons.org/licenses/by-sa/4.0'
        }
    },
    // 2013-09-25
    {
        filename: 'Sterna nereis - Little Swanport.jpg',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: {
            artist: '<a href="//commons.wikimedia.org/wiki/User:JJ_Harrison" title="User:JJ Harrison">JJ Harrison</a> (<a rel="nofollow" class="external free" href="https://www.jjharrison.com.au/">https://www.jjharrison.com.au/</a>)',
            license: 'CC BY-SA 3.0',
            license_url: 'https://creativecommons.org/licenses/by-sa/3.0'
        }
    }
];

describe('Test getImageCredit() in wiki/request.ts', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ SOURCE_NAMES.get(test_case.pic_source) }`, async () => {
            await expect(getImageCredit(test_case.filename, test_case.pic_source))
                .resolves.toEqual(test_case.expected);
        });
    }
});
