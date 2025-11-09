import { PicSource } from '#types/index.js';

export enum TemplateType { PAGE, CAPTION };

const templates = {
    [PicSource.WIKIMEDIA_COMMONS]: {
        [TemplateType.PAGE]: (date: string) => `Template:Potd/${ date }`,
        [TemplateType.CAPTION]: (date: string) => `{{Potd/${ date } (en)}}`,
    },
    [PicSource.WIKIPEDIA_EN]: {
        [TemplateType.PAGE]: (date: string) => `Template:POTD/${ date }`,
        [TemplateType.CAPTION]: (date: string) => `{{POTD/${ date }|caption}}`,
    },
};

export function craftTemplate(date: string, src: PicSource, type: TemplateType) {
    return templates[src][type](date);
}

export const SOURCE_URLS = {
    [PicSource.WIKIMEDIA_COMMONS]: {
        api_url: 'https://commons.wikimedia.org/w/api.php',
        wiki_url: 'https://commons.wikimedia.org/wiki',
    },
    [PicSource.WIKIPEDIA_EN]: {
        api_url: 'https://en.wikipedia.org/w/api.php',
        wiki_url: 'https://en.wikipedia.org/wiki',
    },
};

export function getPageUrl(date: string, src: PicSource) {
    return `${SOURCE_URLS[src].wiki_url}/${craftTemplate(date, src, TemplateType.PAGE)}`;
}

// remove HTML tags that are not supported by Telegram
export function sanitizeHTML(html: string) {
    return html
        .replace(/<style.*?>.*?<\/style>/g, '')  // remove style blocks
        .replace(/<(?!\/?(?:b|strong|i|em|u|ins|s|strike|del|a|code|pre)(?:>|\ .*?>))\/?.*?>/g, '')
        .replace(/^\s*\r?\n/gm, '') // remove empty lines
        .replace(/(\r?\n)$/, '');   // remove last empty line
}
