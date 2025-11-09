export enum PicSource {
    WIKIMEDIA_COMMONS,
    WIKIPEDIA_EN,
};

export const SOURCE_NAMES = new Map([
    [PicSource.WIKIMEDIA_COMMONS, 'commons.wikimedia.org'],
    [PicSource.WIKIPEDIA_EN, 'en.wikipedia.org'],
]);

export type Picture = {
    url: string,
    width: number,
    height: number,
    size: number,
};

export type Potd = {
    date: string,
    src: PicSource,
    pictures: Picture[],
    caption: string,
    credit: string,
    page_url: string,
};

export type Credit = {
    artist: string,
    license: string,
    license_url?: string,
};
