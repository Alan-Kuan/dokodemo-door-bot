import {
    getImageFileNameByDate,
    getImageUrl,
    getImageCredit,
    getImageCaption
} from './request.js';

import { getTemplate } from './template.js';

export async function getUrlOfPotd(date, src) {
    let filename = await getImageFileNameByDate(date, src);
    let img_url = await getImageUrl(filename, src);
    let segments = img_url.split('/');
    segments.splice(5, 0, 'thumb');
    segments.push(`1024px-${ segments[8] }`);
    img_url = segments.join('/');
    return img_url;
}

export async function getCaptionOfPotd(date, src) {
    let template = getTemplate(date, src, 'caption');
    let img_caption = await getImageCaption(template, src);
    return img_caption;
}

export async function getCreditOfPotd(date, src) {
    let filename = await getImageFileNameByDate(date, src);
    let { artist, license, license_url } = await getImageCredit(filename, src);
    if (license_url === null)
        return `Credit: ${ artist }\nLicense: ${ license }`;
    else
        return `Credit: ${ artist }\nLicense: <a href="${ license_url }">${ license }</a>`;
}
