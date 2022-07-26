const axios = require('axios');
const tmpl = require('./template.js');
const { IMG_SRCS, sanitizeHTML } = require('./misc.js');

const URLS = {
    [IMG_SRCS.wikimedia_commons]: {
        api_url: 'https://commons.wikimedia.org/w/api.php',
        wiki_url: 'https://commons.wikimedia.org/wiki',
    },
    [IMG_SRCS.wikipedia_en]: {
        api_url: 'https://en.wikipedia.org/w/api.php',
        wiki_url: 'https://en.wikipedia.org/wiki',
    },
};

const user_agent = `DokodemoDoorBot/${ process.env.BOT_VERSION } (${ process.env.CONTACT })`;

// create an axios instance
const req = axios.create({
    headers: {
        'User-Agent': user_agent
    },
});

req.interceptors.request.use(
    conf => {
        conf.params.format = 'json';
        conf.params.formatversion = 2;
        return conf;
    },
    err => Promise.reject(err)
);

async function getImageFileNameOfDate(date, src) {
    let template = tmpl.getTemplate(date, src, 'image');
    let get_filename = title => {
        return req.get(URLS[src].api_url, {
            params: {
                action: 'expandtemplates',
                prop: 'wikitext',
                text: title
            }
        })
        .then(res => res.data.expandtemplates.wikitext)
        .catch(err => console.error(err));
    };
    return get_filename(template)
        .then(filename => {
            // if there are multiple pictures
            if (filename === '{{{image}}}') {
                template = template.replace('image', 'image1');
                return get_filename(template);
            }
            return filename;
        });
}

async function getImageUrl(filename, src) {
    return req.get(URLS[src].api_url, {
            params: {
                action: 'query',
                prop: 'imageinfo',
                iiprop: 'url',
                titles: `Image:${ filename }`
            }
        })
        .then(res => res.data.query.pages[0].imageinfo[0].url)
        .catch(err => console.error(err));
}

async function getImageCredit(filename, src) {
    return req.get(URLS[src].api_url, {
            params: {
                action: 'query',
                prop: 'imageinfo',
                iiprop: 'extmetadata',
                iiextmetadatafilter: 'LicenseShortName|Artist|LicenseUrl',
                titles: `Image:${ filename }`
            }
        })
        .then(res => {
            let metadata = res.data.query.pages[0].imageinfo[0].extmetadata;
            let artist = sanitizeHTML(metadata.Artist.value);
            let license = metadata.LicenseShortName.value;
            let license_url = metadata.hasOwnProperty('LicenseUrl') ? metadata.LicenseUrl.value : null;
            return { artist, license, license_url };
        })
        .catch(err => console.error(err));
}

async function getImageCaption(title, src) {
    return req.get(URLS[src].api_url, {
            params: {
                action: 'expandtemplates',
                prop: 'wikitext',
                text: title,
            }
        })
        .then(res => {
            let content = res.data.expandtemplates.wikitext;
            return req.get(URLS[src].api_url, {
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
                .replace(/href="\/wiki/g, `href="${ URLS[src].wiki_url }`);
            return caption;
        })
        .catch(err => console.error(err));
}

async function getUrlOfPotd(date, src) {
    let filename = await getImageFileNameOfDate(date, src);
    let img_url = await getImageUrl(filename, src);
    let segments = img_url.split('/');
    segments.splice(5, 0, 'thumb');
    segments.push(`1024px-${ segments[8] }`);
    img_url = segments.join('/');
    return img_url;
}

async function getCaptionOfPotd(date, src) {
    let template = tmpl.getTemplate(date, src, 'caption');
    let img_caption = await getImageCaption(template, src);
    return img_caption;
}

async function getCreditOfPotd(date, src) {
    let filename = await getImageFileNameOfDate(date, src);
    let { artist, license, license_url } = await getImageCredit(filename, src);
    if (license_url === null)
        return `Credit: ${ artist }\nLicense: ${ license }`;
    else
        return `Credit: ${ artist }\nLicense: <a href="${ license_url }">${ license }</a>`;
}

module.exports = { getUrlOfPotd, getCaptionOfPotd, getCreditOfPotd };
