import type { PicSource } from '#types/index.js';
import * as req from '#wiki/request.js';
import { craftTemplate } from '#wiki/utils.js';

export async function getPotd(date: string, src: PicSource) {
    return {
        date, src,
        url: await getUrlOfPotd(date, src),
        caption: await getCaptionOfPotd(date, src),
        credit: await getCreditOfPotd(date, src),
    };
}

export async function getUrlOfPotd(date: string, src: PicSource) {
    const filename = await req.getImageFileNameByDate(date, src);
    const img_url = await req.getImageUrl(filename, src);
    let segments = img_url.split('/');

    segments.splice(5, 0, 'thumb');

    let last_part = `1024px-${ segments[8] }`;
    if (filename.endsWith('.svg')) {
        last_part += '.png';
    }
    segments.push(last_part);

    return segments.join('/');
}

export async function getCaptionOfPotd(date: string, src: PicSource) {
    const template = craftTemplate(date, src, 'caption');
    return await req.getImageCaption(template, src);
}

export async function getCreditOfPotd(date: string, src: PicSource) {
    const filename = await req.getImageFileNameByDate(date, src);
    const credit = await req.getImageCredit(filename, src);

    if (!credit) return '';

    if (credit.license_url === null) {
        return `<b>Credit:</b> ${ credit.artist }\n<b>License:</b> ${ credit.license }`;
    } else {
        return `<b>Credit:</b> ${ credit.artist }\n<b>License:</b> <a href="${ credit.license_url }">${ credit.license }</a>`;
    }
}
