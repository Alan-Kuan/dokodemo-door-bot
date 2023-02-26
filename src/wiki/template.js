import { IMG_SRCS } from './misc.js';

const templates = {
    [IMG_SRCS.wikimedia_commons]: {
        'image': date => `{{Potd/${ date }}}`,
        'caption': date => `{{Potd/${ date } (en)}}`,
    },
    [IMG_SRCS.wikipedia_en]: {
        'image': date => `{{POTD/${ date }|image}}`,
        'caption': date => `{{POTD/${ date }|caption}}`,
    },
};

export function getTemplate(date,src, type) {
    return templates[src][type](date);
}
