import { describe, it, expect } from 'vitest';

import { paginate } from '#utils/pagination.js';

type TestCase = {
    desc: string,
    html: string,
    limit: number,
    unclosed_tags: string[],
    expected: ReturnType<typeof paginate>,
};

const test_cases: TestCase[] = [
    {
        desc: 'should return early if the length of the html string is shorter than the limit',
        html: '<strong>hello, world!</strong>',
        limit: 100,
        unclosed_tags: [],
        expected: {
            paginated_html: '<strong>hello, world!</strong>',
            end_idx: 30,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should close unclosed tags immediately after the limit is hit',
        html: '<strong>hello, world!</strong>',
        limit: 8,
        unclosed_tags: [],
        expected: {
            paginated_html: '<strong>hello,</strong>',
            end_idx: 14,
            unclosed_tags: ['strong'],
        },
    },
    {
        desc: 'should add prefix if unclosed tags are provided',
        html: ' world!</strong>',
        limit: 8,
        unclosed_tags: ['strong'],
        expected: {
            paginated_html: '<strong> world!</strong>',
            end_idx: 16,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should keep reading if stops just before the ends of tags',
        html: '<b><em>hell world!</em></b>',
        limit: 11,
        unclosed_tags: [],
        expected: {
            paginated_html: '<b><em>hell world!</em></b>',
            end_idx: 27,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should retreat to the end of last complete word if stops at an uncomplete word (1)',
        html: 'hello, world!',
        limit: 10,
        unclosed_tags: [],
        expected: {
            paginated_html: 'hello,',
            end_idx: 6,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should retreat to the end of last complete word if stops at an uncomplete word (2)',
        html: 'hello',
        limit: 1,
        unclosed_tags: [],
        expected: {
            paginated_html: '',
            end_idx: 0,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should retreat to the end of last complete word if stops at an uncomplete word (3)',
        html: '<b>hello</b>',
        limit: 1,
        unclosed_tags: [],
        expected: {
            paginated_html: '',
            end_idx: 0,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should retreat to the end of last complete word if stops at an uncomplete word (4)',
        html: '<b>hello</b>world',
        limit: 6,
        unclosed_tags: [],
        expected: {
            paginated_html: '',
            end_idx: 0,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should retreat to the end of last complete word if stops at an uncomplete word (5)',
        html: '<b>hello </b>world',
        limit: 8,
        unclosed_tags: [],
        expected: {
            paginated_html: '<b>hello</b>',
            end_idx: 8,
            unclosed_tags: ['b'],
        },
    },
    {
        desc: 'should retreat to the end of last complete word if stops at an uncomplete word (6)',
        html: '<b>hello foo</b>world',
        limit: 11,
        unclosed_tags: [],
        expected: {
            paginated_html: '<b>hello</b>',
            end_idx: 8,
            unclosed_tags: ['b'],
        },
    },
    {
        desc: 'should retreat to the end of last complete word if stops at an uncomplete word (7)',
        html: '<b><a href="https://example.com">hello</a>world</b>',
        limit: 6,
        unclosed_tags: [],
        expected: {
            paginated_html: '',
            end_idx: 0,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should retreat before an <a> tag if stops inside an unclosed <a> tag',
        html: 'hello, <a href="https://example.com">url world!</a>',
        limit: 14,
        unclosed_tags: [],
        expected: {
            paginated_html: 'hello, ',
            end_idx: 7,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should retreat to the end of last complete word and even before an <a> tag',
        html: '<b><a href="https://example.com">hello foo</a>world</b>',
        limit: 11,
        unclosed_tags: [],
        expected: {
            paginated_html: '',
            end_idx: 0,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should start with inheritted unclosed tags',
        html: 'foo world</b> <i>blah</i>',
        limit: 20,
        unclosed_tags: ['b'],
        expected: {
            paginated_html: '<b>foo world</b> <i>blah</i>',
            end_idx: 25,
            unclosed_tags: [],
        },
    },
    {
        desc: 'should ignore < and > in attributes of tags',
        html: '<a href="oops < > ">a link</a>',
        limit: 20,
        unclosed_tags: [],
        expected: {
            paginated_html: '<a href="oops < > ">a link</a>',
            end_idx: 30,
            unclosed_tags: [],
        },
    },
];

const test_cases_invalid = [
    { html: '<<' },
    { html: '>' },
];

describe('Test paginate() in utils/pagination.ts', () => {
    for (const test_case of test_cases) {
        it(test_case.desc, () => {
            const res = paginate(test_case.html, test_case.limit, test_case.unclosed_tags);
            expect(res).toStrictEqual(test_case.expected);
        });
    }
    for (const test_case of test_cases_invalid) {
        it('should throw an error if an invalid HTML string is given', () => {
            const call = () => paginate(test_case.html, 20, []);
            expect(call).toThrowError('Invalid HTML string');
        });
    }
});
