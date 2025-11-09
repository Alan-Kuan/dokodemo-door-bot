import type { Credit, PicSource, Potd } from '#types/index.js';
import {
    getCaptionByDate,
    getCredit,
    getFilenamesByDate,
    getPicture,
} from '#wiki/request.js';
import { getPageUrl } from '#wiki/utils.js';

export async function getPotd(date: string, src: PicSource): Promise<Potd> {
    const filenames = await getFilenamesByDate(date, src);

    return {
        date,
        src,
        pictures: await Promise.all(
            filenames.map(async filename => getPicture(filename, src))
        ),
        caption: await getCaptionByDate(date, src),
        credit: getFormattedCredit(await getCredit(filenames[0], src)),
        page_url: getPageUrl(date, src),
    };
}

function getFormattedCredit(credit: Credit) {
    if (credit.license_url) {
        return `<b>Credit:</b> ${ credit.artist }\n<b>License:</b> <a href="${ credit.license_url }">${ credit.license }</a>`;
    } else {
        return `<b>Credit:</b> ${ credit.artist }\n<b>License:</b> ${ credit.license }`;
    }
}

if (import.meta.vitest) {
    const { describe, expect, test } = import.meta.vitest;

    const test_cases = [
        {
            credit: {
                artist: 'New York : Liebler &amp; Maass Lith.',
                license: 'Public domain',
            },
            expected: '<b>Credit:</b> New York\xa0: Liebler &amp; Maass Lith.\n<b>License:</b> Public domain',
        },
        {
            credit: {
                artist: '<a href="https://www.wikidata.org/wiki/Q28147777" class="extiw" title="d:Q28147777">Diego Delso</a>\n',
                license: 'CC BY-SA 4.0',
                license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
            },
            expected: '<b>Credit:</b> <a href="https://www.wikidata.org/wiki/Q28147777" class="extiw" title="d:Q28147777">Diego Delso</a>\n\n<b>License:</b> <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>',
        },
    ];

    describe('Test getFormattedCredit() in wiki/potd.ts', () => {
        for (const [idx, test_case] of test_cases.entries()) {
            test(`Test ${idx}`, async () => {
                expect(getFormattedCredit(test_case.credit)).toBe(test_case.expected);
            });
        }
    });
}
