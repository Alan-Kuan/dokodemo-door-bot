import axios from 'axios';

import { type Credit, type Picture, PicSource } from '#types/index.js';
import { paginate } from '#utils/index.js';
import { craftTemplate, SOURCE_URLS, sanitizeHTML, TemplateType } from '#wiki/utils.js';

const req = axios.create({
    headers: {
        'User-Agent': `DokodemoDoorBot/${ process.env.BOT_VERSION } (${ process.env.CONTACT })`,
    },
    params: {
        format: 'json',
        formatversion: 2,
    },
});

export async function getFilenamesByDate(date: string, src: PicSource): Promise<string[]> {
    const res = await req.get(SOURCE_URLS[src].api_url, {
        params: {
            action: 'parse',
            prop: 'images',
            page: craftTemplate(date, src, TemplateType.PAGE),
        }
    });

    return res.data.parse.images;
}

export async function getCaptionByDate(date: string, src: PicSource): Promise<string> {
    const res = await req.get(SOURCE_URLS[src].api_url, {
            params: {
                action: 'expandtemplates',
                prop: 'wikitext',
                text: craftTemplate(date, src, TemplateType.CAPTION),
            }
        })
        .then(async res => await req.get(SOURCE_URLS[src].api_url, {
                params: {
                    action: 'parse',
                    prop: 'text',
                    contentmodel: 'wikitext',
                    text: res.data.expandtemplates.wikitext,
                    wrapoutputclass: '',
                    disablelimitreport: 1
                }
            })
        );

    return sanitizeHTML(res.data.parse.text)
        // replace `\\"` with `"`, remove `\\n` and `\\r`
        .replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\r/g, '')
        // prepend wiki base url to links
        .replace(/href="\/wiki/g, `href="${SOURCE_URLS[src].wiki_url}`);
}

export async function getPicture(filename: string, src: PicSource): Promise<Picture> {
    const res = await req.get(SOURCE_URLS[src].api_url, {
        params: {
            action: 'query',
            titles: `File:${filename}`,
            prop: 'imageinfo',
            iiprop: 'url|size',
            iiurlwidth: 1024,
        }
    });
    const info = res.data.query.pages[0].imageinfo[0];
    const thumb_res = await req.head(info.thumburl);

    return {
        url: info.thumburl,
        width: info.thumbwidth,
        height: info.thumbheight,
        size: Number(thumb_res.headers['content-length']),
    };
}

export async function getCredit(filename: string, src: PicSource): Promise<Credit> {
    const res = await req.get(SOURCE_URLS[src].api_url, {
        params: {
            action: 'query',
            prop: 'imageinfo',
            iiprop: 'extmetadata',
            iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
            titles: `File:${filename}`
        }
    });
    const metadata = res.data.query.pages[0].imageinfo[0].extmetadata;

    let artist = sanitizeHTML(metadata.Artist.value);
    // limit artist length
    const pag_res = paginate(artist, 50, []);
    if (pag_res.end_idx < artist.length) {
        artist = pag_res.paginated_html + '...';
    }

    return {
        artist,
        license: metadata.LicenseShortName.value,
        license_url: metadata.LicenseUrl?.value,
    };
}
