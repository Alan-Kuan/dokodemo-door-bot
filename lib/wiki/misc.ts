export enum PicSource {
    WIKIMEDIA_COMMONS,
    WIKIPEDIA_EN,
};

export const SOURCE_NAMES = {
    [PicSource.WIKIMEDIA_COMMONS]: 'commons.wikimedia.org',
    [PicSource.WIKIPEDIA_EN]: 'en.wikipedia.org'
};


// remove HTML tags that are not supported by Telegram
export function sanitizeHTML(origin: string) {
    return origin.replace(/<(?!\/?(?:b|strong|i|em|u|ins|s|strike|del|a|code|pre)(?:>|\ .*?>))\/?.*?>/g, '')
        .replace(/^\s*\r?\n/gm, '');  // remove empty lines
}
