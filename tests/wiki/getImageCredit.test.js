const rewire = require('rewire');
const wiki = rewire('../../src/wiki.js');

const getImageCredit = wiki.__get__('getImageCredit');

const srcs = {
    'c': 'commons.wikimedia.org',
    'e': 'en.wikipedia.org'
};

const test_cases = [{
        src: wiki.IMG_SRCS.wikimedia_commons,
        title: '{{Potd/2020-03-04}}',
        expected_artist: '<a href="//commons.wikimedia.org/wiki/User:Gzen92" title="User:Gzen92">Gzen92</a>',
        expected_license: 'CC BY-SA 4.0',
        expected_license_url: 'https://creativecommons.org/licenses/by-sa/4.0'
    },
    {
        src: wiki.IMG_SRCS.wikipedia_en,
        title: '{{POTD/2013-09-25|image}}',
        expected_artist: '<a href="//commons.wikimedia.org/wiki/User:JJ_Harrison" title="User:JJ Harrison">JJ Harrison</a> (<a rel="nofollow" class="external free" href="https://www.jjharrison.com.au/">https://www.jjharrison.com.au/</a>)',
        expected_license: 'CC BY-SA 3.0',
        expected_license_url: 'https://creativecommons.org/licenses/by-sa/3.0'
    }];

for(let test_case of test_cases) {
    test(`Test getImageCredit() in src/wiki.js with source of ${ srcs[test_case.src] }`, async () => {
        var { artist, license, license_url } = await getImageCredit(test_case.title, test_case.src);
        expect(artist).toBe(test_case.expected_artist);
        expect(license).toBe(test_case.expected_license);
        expect(license_url).toBe(test_case.expected_license_url);
    });
}
