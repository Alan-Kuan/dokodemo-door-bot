import axios from 'axios';

import { getTemplate } from '#wiki/template.js';
import { PicSource, sanitizeHTML } from '#wiki/misc.js';

const SOURCE_URLS = {
    [PicSource.WIKIMEDIA_COMMONS]: {
        api_url: 'https://commons.wikimedia.org/w/api.php',
        wiki_url: 'https://commons.wikimedia.org/wiki',
    },
    [PicSource.WIKIPEDIA_EN]: {
        api_url: 'https://en.wikipedia.org/w/api.php',
        wiki_url: 'https://en.wikipedia.org/wiki',
    },
};

const user_agent = `DokodemoDoorBot/${ process.env.BOT_VERSION } (${ process.env.CONTACT })`;
const req = axios.create({
    headers: {
        'User-Agent': user_agent,
    },
    params: {
        format: 'json',
        formatversion: 2,
    },
});

export async function getImageFileNameByDate(date: string, src: PicSource) {
    const get_filename = async (title: string) => {
        return await req.get(SOURCE_URLS[src].api_url, {
                params: {
                    action: 'expandtemplates',
                    prop: 'wikitext',
                    text: title
                }
            })
            .then(res => res.data.expandtemplates.wikitext)
            .catch(err => console.error(err.message));
    };

    let template = getTemplate(date, src, 'image');
    const filename = await get_filename(template)
        .then(async filename => {
            // if there are multiple pictures
            if (filename === '{{{image}}}') {
                template = template.replace('image', 'image1');
                return await get_filename(template);
            }
            return filename;
        });

    return filename;
}

export async function getImageUrl(filename: string, src: PicSource) {
    const img_url = await req.get(SOURCE_URLS[src].api_url, {
            params: {
                action: 'query',
                prop: 'imageinfo',
                iiprop: 'url',
                titles: `Image:${ filename }`
            }
        })
        .then(res => res.data.query.pages[0].imageinfo[0].url)
        .catch(err => {
            console.error(err.message);
            return '';
        });

    return img_url;
}

export async function getImageCredit(filename: string, src: PicSource) {
    const img_credit = await req.get(SOURCE_URLS[src].api_url, {
            params: {
                action: 'query',
                prop: 'imageinfo',
                iiprop: 'extmetadata',
                iiextmetadatafilter: 'LicenseShortName|Artist|LicenseUrl',
                titles: `Image:${ filename }`
            }
        })
        .then(res => {
            const metadata = res.data.query.pages[0].imageinfo[0].extmetadata;
            const artist = sanitizeHTML(metadata.Artist.value);
            const license = metadata.LicenseShortName.value;
            const license_url = metadata.hasOwnProperty('LicenseUrl') ? metadata.LicenseUrl.value : null;
            return { artist, license, license_url };
        })
        .catch((err): null => {
            console.error(err.message);
            return null;
        });

    return img_credit;
}

export async function getImageCaption(title: string, src: PicSource) {
    const img_caption = await req.get(SOURCE_URLS[src].api_url, {
            params: {
                action: 'expandtemplates',
                prop: 'wikitext',
                text: title,
            }
        })
        .then(async res => {
            let content = res.data.expandtemplates.wikitext;
            return await req.get(SOURCE_URLS[src].api_url, {
                    params: {
                        action: 'parse',
                        prop: 'text',
                        contentmodel: 'wikitext',
                        text: content,
                        wrapoutputclass: '',
                        disablelimitreport: 1
                    }
                });
        })
        .then(res => {
            let caption = sanitizeHTML(res.data.parse.text)
                .replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\r/g, '')
                .replace(/href="\/wiki/g, `href="${ SOURCE_URLS[src].wiki_url }`);
            return caption;
        })
        .catch(err => {
            console.error(err.message);
            return '';
        });

    return img_caption;
}
