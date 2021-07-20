const { getCaptionOfPotd, IMG_SRCS } = require('../../src/wiki.js');

const srcs = {
    'c': 'commons.wikimedia.org',
    'e': 'en.wikipedia.org'
};

const test_cases = [{
        date: '2008-10-16',
        src: IMG_SRCS.wikimedia_commons,
        expected: `La Catrina – In Mexican folk culture, the Catrina, popularized by <a href="https://en.wikipedia.org/wiki/Jos%C3%A9_Guadalupe_Posada" class="extiw" title="en:José Guadalupe Posada">José Guadalupe Posada</a>, is the skeleton of a high society woman and one of the most popular figures of the <a href="https://en.wikipedia.org/wiki/Day_of_the_Dead" class="extiw" title="en:Day of the Dead">Day of the Dead</a> celebrations in Mexico.Height&#160;: about 15 inches - 38 cm. Picture taken at the Museo de la Ciudad, Leon, Guanajuato, Mexico... a public place
`
    },
    {
        date: '2014-04-27',
        src: IMG_SRCS.wikipedia_en,
        expected: `An overhead view of <a href="https://en.wikipedia.org/wiki/Skylab" title="Skylab">Skylab</a>, the United States' first space station, in Earth orbit as photographed from the <b><a href="https://en.wikipedia.org/wiki/Skylab_4" title="Skylab 4">Skylab 4 Command and Service Modules</a></b>. Skylab 4 was the last mission to Skylab and brought back its final crew; this photograph was the last one taken of the station before the mission re-entered Earth's atmosphere and disintegrated in 1979.
`
    }];

for(let test_case of test_cases) {
    test(`Test getCaptionOfPotd() in src/wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getCaptionOfPotd(test_case.date, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
