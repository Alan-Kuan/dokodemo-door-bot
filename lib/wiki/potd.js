import {
    getImageFileNameByDate,
    getImageUrl,
    getImageCredit,
    getImageCaption
} from './request.js';

import { getTemplate } from './template.js';

export async function getUrlOfPotd(date, src) {
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

export async function getCaptionOfPotd(date, src) {
    const template = getTemplate(date, src, 'caption');
    return await getImageCaption(template, src);
}

export async function getCreditOfPotd(date, src) {
    const filename = await getImageFileNameByDate(date, src);
    const { artist, license, license_url } = await getImageCredit(filename, src);

    if (license_url === null) {
        return `Credit: ${ artist }\nLicense: ${ license }`;
    } else {
        return `Credit: ${ artist }\nLicense: <a href="${ license_url }">${ license }</a>`;
    }
}
