import { IMG_SRCS } from '../../lib/wiki/index.js';
import rewire from 'rewire';
const request = rewire('../../lib/wiki/request.js');

const getImageCaption = request.__get__('getImageCaption');

const srcs = {
    [IMG_SRCS.wikimedia_commons]: 'commons.wikimedia.org',
    [IMG_SRCS.wikipedia_en]: 'en.wikipedia.org'
};

const test_cases = [
    {
        src: IMG_SRCS.wikimedia_commons,
        title: '{{Potd/2013-08-01 (en)}}',
        expected: `Animated view of <a href="https://en.wikipedia.org/wiki/Jupiter" class="extiw" title="en:Jupiter">Jupiter</a> getting larger. These pictures were taken every 10 hours over 28 days in 1979 by <a href="https://en.wikipedia.org/wiki/Voyager_1" class="extiw" title="en:Voyager 1">Voyager 1</a> probe
`
    },
    {
        src: IMG_SRCS.wikipedia_en,
        title: '{{POTD/2015-11-05|caption}}',
        expected: `<i><b><a href="https://en.wikipedia.org/wiki/The_Kid_(1921_film)" title="The Kid (1921 film)">The Kid</a></b></i> is a 1921 American <a href="https://en.wikipedia.org/wiki/Silent_film" title="Silent film">silent</a> <a href="https://en.wikipedia.org/wiki/Comedy-drama" class="mw-redirect" title="Comedy-drama">comedy-drama</a> film starring <a href="https://en.wikipedia.org/wiki/Charlie_Chaplin" title="Charlie Chaplin">Charlie Chaplin</a> and <a href="https://en.wikipedia.org/wiki/Jackie_Coogan" title="Jackie Coogan">Jackie Coogan</a>. This was Chaplin's first full-length film as a director; he also wrote and produced the film, which follows a young boy who is abandoned by his mother and raised by <a href="https://en.wikipedia.org/wiki/The_Tramp" title="The Tramp">The Tramp</a>. It was the second-highest grossing film in 1921. Innovative in its combination of comedic and dramatic elements, <i>The Kid</i> has been considered <a href="https://en.wikipedia.org/wiki/List_of_films_considered_the_best" title="List of films considered the best">one of the greatest films of the silent era</a>.
`
    }
];

for (let test_case of test_cases) {
    test(`Test getImageCaption() in wiki.js with source of ${ srcs[test_case.src] }`, () => {
        return expect(getImageCaption(test_case.title, test_case.src))
            .resolves.toBe(test_case.expected);
    });
}
