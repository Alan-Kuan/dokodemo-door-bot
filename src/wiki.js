const axios = require('axios');

const IMG_SRCS = {
    wikimedia_commons: 'c',
    wikipedia_en: 'e'
};

const api_urls = {
    'c': 'https://commons.wikimedia.org/w/api.php',
    'e': 'https://en.wikipedia.org/w/api.php', 
};

async function getImageFileName(title, src) {
    const res = axios.get(api_urls[src], {
            params: {
                action: 'expandtemplates',
                format: 'json',
                formatversion: 2,
                prop: 'wikitext',
                text: title
            }
        })
        .then(res => {
            return res.data.expandtemplates.wikitext;
        });
    return res;
}

async function getImageUrl(title, src) {
    const res = getImageFileName(title, src)
        .then(filename => {
            return axios.get(api_urls[src], {
                params: {
                    action: 'query',
                    format: 'json',
                    formatversion: 2,
                    prop: 'imageinfo',
                    iiprop: 'url',
                    titles: `Image:${filename}`
                    
                }
            });
        })
        .then(res => {
            return res.data.query.pages[0].imageinfo[0].url;
        })
        .catch(err => {
            console.log(err);
        });
    return res;
}

async function getImageCredit(title, src) {
    const res = getImageFileName(title, src)
        .then(filename => {
            return axios.get(api_urls[src], {
                params: {
                    action: 'query',
                    format: 'json',
                    formatversion: 2,
                    prop: 'imageinfo',
                    iiprop: 'extmetadata',
                    iiextmetadatafilter: 'LicenseShortName|Artist|LicenseUrl',
                    titles: `Image:${filename}`
                }
            });
        })
        .then(res => {
            let metadata = res.data.query.pages[0].imageinfo[0].extmetadata;
            let artist = metadata.Artist.value
                // escape html tags, since there may be tags that cannot be rendered on Telegram
                .replace(/<.*?>/g, '').replace(/<\/.*?>/g, '')
                // replace multiple white spaces with one space
                .replace(/\s\s+/g, ' ');
            let license = metadata.LicenseShortName.value;
            let license_url = metadata.LicenseUrl.value;
            return { artist, license, license_url };
        });
    return res;
}

async function getImageCaption(title, src) {
    const res = axios.get(api_urls[src], {
            params: {
                action: 'expandtemplates',
                format: 'json',
                formatversion: 2,
                prop: 'wikitext',
                text: title,
            }
        })
        .then(res => {
            let content = res.data.expandtemplates.wikitext;
            return axios.get(api_urls[src], {
                params: {
                    action: 'parse',
                    format: 'json',
                    formatversion: 2,
                    prop: 'text',
                    contentmodel: 'wikitext',
                    text: content,
                    wrapoutputclass: '',
                    disablelimitreport: 1
                }
            })
        })
        .then(res => {
            let caption = res.data.parse.text.replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\r/g, '')
                .replace(/<p>/g, '').replace(/<\/p>/g, '');
            switch(src) {
            case IMG_SRCS.wikimedia_commons:
                 caption = caption.replace(/href="\/wiki/g, 'href="https://commons.wikimedia.org/wiki');
                break;
            case IMG_SRCS.wikipedia_en:
                caption = caption.replace(/href="\/wiki/g, 'href="https://en.wikipedia.org/wiki');
                break;
            }
            return caption;
        })
        .catch(err => {
            console.log(err);
        });
    return res;
}

async function getUrlOfPotd(date, src) {
    switch(src) {
    case IMG_SRCS.wikimedia_commons:
        var template = `{{Potd/${date}}}`;
        var img_url = await getImageUrl(template, src);
        break;
    case IMG_SRCS.wikipedia_en:
        var template = `{{POTD/${date}|image}}`;
        var img_url = await getImageUrl(template, src);
        break;
    }
    let segments = img_url.split('/');
    segments.splice(5, 0, 'thumb');
    segments.push(`1024px-${segments[8]}`);
    img_url = segments.join('/');
    return img_url;
}

async function getCaptionOfPotd(date, src) {
    switch(src) {
    case IMG_SRCS.wikimedia_commons:
        var template = `{{Potd/${date} (en)}}`;
        var img_caption = await getImageCaption(template, src);
        break;
    case IMG_SRCS.wikipedia_en:
        var template = `{{POTD/${date}|caption}}`;
        var img_caption = await getImageCaption(template, src);
        break;
    }
    return img_caption;
}

async function getCreditOfPotd(date, src) {
    switch(src) {
    case IMG_SRCS.wikimedia_commons:
        var template = `{{Potd/${date}}}`;
        var { artist, license, license_url } = await getImageCredit(template, src);
        break;
    case IMG_SRCS.wikipedia_en:
        var template = `{{POTD/${date}|image}}`;
        var { artist, license, license_url } = await getImageCredit(template, src);
        break;
    }
    return `Credit: ${artist}\nLicense: <a href="${license_url}">${license}</a>`;
}

module.exports = { getUrlOfPotd, getCaptionOfPotd, getCreditOfPotd, IMG_SRCS };
