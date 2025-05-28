export enum PicSource {
    WIKIMEDIA_COMMONS,
    WIKIPEDIA_EN,
};

export const SOURCE_NAMES = new Map([
    [PicSource.WIKIMEDIA_COMMONS, 'commons.wikimedia.org'],
    [PicSource.WIKIPEDIA_EN, 'en.wikipedia.org'],
]);

export type Picture = {
    date: string,
    src: PicSource,
    url: string,
    caption: string,
    credit: string,
};
