import { describe, test, expect } from 'vitest';

import { PicSource, SOURCE_NAMES } from '#types/index.js';
import { getImageCaption } from '#wiki/request.js';

const test_cases = [
    {
        title: '{{Potd/2013-08-01 (en)}}',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: `Animated view of <a href="https://en.wikipedia.org/wiki/Jupiter" class="extiw" title="en:Jupiter">Jupiter</a> getting larger. These pictures were taken every 10 hours over 28 days in 1979 by <a href="https://en.wikipedia.org/wiki/Voyager_1" class="extiw" title="en:Voyager 1">Voyager 1</a> probe\n`
    },
    {
        title: '{{Potd/2008-10-16 (en)}}',
        pic_source: PicSource.WIKIMEDIA_COMMONS,
        expected: `La Catrina – In Mexican folk culture, the Catrina, popularized by <a href="https://en.wikipedia.org/wiki/Jos%C3%A9_Guadalupe_Posada" class="extiw" title="en:José Guadalupe Posada">José Guadalupe Posada</a>, is the skeleton of a high society woman and one of the most popular figures of the <a href="https://en.wikipedia.org/wiki/Day_of_the_Dead" class="extiw" title="en:Day of the Dead">Day of the Dead</a> celebrations in Mexico.Height&#160;: about 15 inches - 38 cm. Picture taken at the Museo de la Ciudad, Leon, Guanajuato, Mexico... a public place\n`
    },
    {
        title: '{{POTD/2015-11-05|caption}}',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: `<i><b><a href="https://en.wikipedia.org/wiki/The_Kid_(1921_film)" title="The Kid (1921 film)">The Kid</a></b></i> is a 1921 American <a href="https://en.wikipedia.org/wiki/Silent_film" title="Silent film">silent</a> <a href="https://en.wikipedia.org/wiki/Comedy-drama" class="mw-redirect" title="Comedy-drama">comedy-drama</a> film starring <a href="https://en.wikipedia.org/wiki/Charlie_Chaplin" title="Charlie Chaplin">Charlie Chaplin</a> and <a href="https://en.wikipedia.org/wiki/Jackie_Coogan" title="Jackie Coogan">Jackie Coogan</a>. This was Chaplin's first full-length film as a director; he also wrote and produced the film, which follows a young boy who is abandoned by his mother and raised by <a href="https://en.wikipedia.org/wiki/The_Tramp" title="The Tramp">The Tramp</a>. It was the second-highest grossing film in 1921. Innovative in its combination of comedic and dramatic elements, <i>The Kid</i> has been considered <a href="https://en.wikipedia.org/wiki/List_of_films_considered_the_best" class="mw-redirect" title="List of films considered the best">one of the greatest films of the silent era</a>.\n`
    },
    {
        title: '{{POTD/2014-04-27|caption}}',
        pic_source: PicSource.WIKIPEDIA_EN,
        expected: `An overhead view of <a href="https://en.wikipedia.org/wiki/Skylab" title="Skylab">Skylab</a>, the United States' first space station, in Earth orbit as photographed from the <b><a href="https://en.wikipedia.org/wiki/Skylab_4" title="Skylab 4">Skylab 4 Command and Service Modules</a></b>. Skylab 4 was the last mission to Skylab and brought back its final crew; this photograph was the last one taken of the station before the mission re-entered Earth's atmosphere and disintegrated in 1979.\n`
    }
];

describe('Test getImageCaption() in wiki/request.ts', () => {
    for (const test_case of test_cases) {
        test(`pic_source = ${ SOURCE_NAMES.get(test_case.pic_source) }`, async () => {
            await expect(getImageCaption(test_case.title, test_case.pic_source))
                .resolves.toBe(test_case.expected);
        });
    }
});
