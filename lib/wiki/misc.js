export const PIC_SOURCES = {
    wikimedia_commons: 0,
    wikipedia_en: 1,
};

export const SOURCE_NAMES = {
    [PIC_SOURCES.wikimedia_commons]: 'commons.wikimedia.org',
    [PIC_SOURCES.wikipedia_en]: 'en.wikipedia.org'
};

export const SOURCE_URLS = {
    [PIC_SOURCES.wikimedia_commons]: {
        api_url: 'https://commons.wikimedia.org/w/api.php',
        wiki_url: 'https://commons.wikimedia.org/wiki',
    },
    [PIC_SOURCES.wikipedia_en]: {
        api_url: 'https://en.wikipedia.org/w/api.php',
        wiki_url: 'https://en.wikipedia.org/wiki',
    },
};


// remove HTML tags that are not supported by Telegram
export function sanitizeHTML(origin) {
    return origin.replace(/<(?!\/?(?:b|strong|i|em|u|ins|s|strike|del|a|code|pre)(?:>|\ .*?>))\/?.*?>/g, '')
        .replace(/^\s*\r?\n/gm, '');  // remove empty lines
}
