import {
    getImageFileNameByDate,
    getImageUrl,
    getImageCredit,
    getImageCaption
} from '#wiki/request.ts';
import { getTemplate } from '#wiki/template.ts';
import type { PicSource } from '#wiki/misc.ts';

export async function getUrlOfPotd(date: string, src: PicSource) {
    const filename = await getImageFileNameByDate(date, src);
    const img_url = await getImageUrl(filename, src);
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
    const template = getTemplate(date, src, 'caption');
    return await getImageCaption(template, src);
}

export async function getCreditOfPotd(date: string, src: PicSource) {
    const filename = await getImageFileNameByDate(date, src);
    const credit = await getImageCredit(filename, src);

    if (!credit) return '';

    if (credit.license_url === null) {
        return `Credit: ${ credit.artist }\nLicense: ${ credit.license }`;
    } else {
        return `Credit: ${ credit.artist }\nLicense: <a href="${ credit.license_url }">${ credit.license }</a>`;
    }
}
