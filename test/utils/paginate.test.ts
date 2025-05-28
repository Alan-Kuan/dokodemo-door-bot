import { describe, it, expect } from 'vitest';

import { paginate } from '#utils/pagination.js';
import type { Tag } from '#utils/index.js';

const test_cases = [
    {
        should: 'should return early if the length of the html string is shorter than the limit',
        html: '<strong>hello, world!</strong>',
        limit: 100,
        unclosed_tags: [] as Tag[],
        expected: {
            paginated_html: '<strong>hello, world!</strong>',
            end_idx: 30,
            unclosed_tags: [] as Tag[],
        },
    },
    {
        should: 'should close unclosed tags immediately after the limit is hit',
        html: '<strong>hello, world!</strong>',
        limit: 8,
        unclosed_tags: [] as Tag[],
        expected: {
            paginated_html: '<strong>hello,</strong>',
            end_idx: 14,
            unclosed_tags: [
                { name: 'strong', pos: 0 },
            ],
        },
    },
    {
        should: 'should add prefix if unclosed tags are provided',
        html: ' world!</strong>',
        limit: 8,
        unclosed_tags: [
            { name: 'strong', pos: 0 },
        ],
        expected: {
            paginated_html: '<strong> world!</strong>',
            end_idx: 16,
            unclosed_tags: [] as Tag[],
        },
    },
    {
        should: 'should keep reading if stops just before the ends of tags',
        html: '<b><em>hell world!</em></b>',
        limit: 11,
        unclosed_tags: [] as Tag[],
        expected: {
            paginated_html: '<b><em>hell world!</em></b>',
            end_idx: 27,
            unclosed_tags: [] as Tag[],
        },
    },
    {
        should: 'should retreat to the end of last complete word if stops at an uncomplete word',
        html: 'hello, world!',
        limit: 10,
        unclosed_tags: [] as Tag[],
        expected: {
            paginated_html: 'hello,',
            end_idx: 6,
            unclosed_tags: [] as Tag[],
        },
    },
    {
        should: 'should retreat before an <a> tag if stops inside an unclosed <a> tag',
        html: 'hello, <a href="https://example.com">url world!</a>',
        limit: 14,
        unclosed_tags: [] as Tag[],
        expected: {
            paginated_html: 'hello, ',
            end_idx: 7,
            unclosed_tags: [] as Tag[],
        },
    },
    {
        should: 'should ignore < and > in attributes of tags',
        html: '<a href="oops < > ">a link</a>',
        limit: 20,
        unclosed_tags: [] as Tag[],
        expected: {
            paginated_html: '<a href="oops < > ">a link</a>',
            end_idx: 30,
            unclosed_tags: [] as Tag[],
        },
    },
];

const test_cases_invalid = [
    {
        html: '<<',
    },
    {
        html: '>',
    },
];

describe('Test paginate() in utils/pagination.ts', () => {
    for (const test_case of test_cases) {
        it(test_case.should, () => {
            const res = paginate(test_case.html, test_case.limit, test_case.unclosed_tags);
            expect(res).toStrictEqual(test_case.expected);
        });
    }
    for (const test_cases of test_cases_invalid) {
        it('should throw an error if an invalid HTML string is given', () => {
            const call = () => paginate(test_cases.html, 20, []);
            expect(call).toThrowError('Invalid HTML string');
        });
    }
});
