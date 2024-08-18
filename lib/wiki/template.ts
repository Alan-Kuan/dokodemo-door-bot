import { PicSource } from '#wiki/misc.ts';

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

export function getTemplate(date: string, src: PicSource, type: 'image' | 'caption') {
    return templates[src][type](date);
}
