import { PicSource } from '#types/index.js';

const templates = {
    [PicSource.WIKIMEDIA_COMMONS]: {
        'image': (date: string) => `{{Potd/${ date }}}`,
        'caption': (date: string) => `{{Potd/${ date } (en)}}`,
    },
    [PicSource.WIKIPEDIA_EN]: {
        'image': (date: string) => `{{POTD/${ date }|image}}`,
        'caption': (date: string) => `{{POTD/${ date }|caption}}`,
    },
};

export function craftTemplate(date: string, src: PicSource, type: 'image' | 'caption') {
    return templates[src][type](date);
}

// remove HTML tags that are not supported by Telegram
export function sanitizeHTML(html: string) {
    return html.replace(/<(?!\/?(?:b|strong|i|em|u|ins|s|strike|del|a|code|pre)(?:>|\ .*?>))\/?.*?>/g, '')
        .replace(/^\s*\r?\n/gm, '');  // remove empty lines
}
