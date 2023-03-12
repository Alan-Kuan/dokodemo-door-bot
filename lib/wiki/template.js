import { PIC_SOURCES } from './misc.js';

const templates = {
    [PIC_SOURCES.wikimedia_commons]: {
        'image': date => `{{Potd/${ date }}}`,
        'caption': date => `{{Potd/${ date } (en)}}`,
    },
    [PIC_SOURCES.wikipedia_en]: {
        'image': date => `{{POTD/${ date }|image}}`,
        'caption': date => `{{POTD/${ date }|caption}}`,
    },
};

export function getTemplate(date, src, type) {
    return templates[src][type](date);
}
