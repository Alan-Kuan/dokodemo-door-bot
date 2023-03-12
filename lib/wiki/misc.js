export const PIC_SOURCES = {
    wikimedia_commons: 0,
    wikipedia_en: 1,
};

// remove HTML tags that are not supported by Telegram
export function sanitizeHTML(origin) {
    return origin.replace(/<(?!\/?(?:b|strong|i|em|u|ins|s|strike|del|a|code|pre)(?:>|\ .*?>))\/?.*?>/g, '')
        .replace(/^\s*\r?\n/gm, '');  // remove empty lines
}
