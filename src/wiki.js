const axios = require('axios');

const IMG_SRCS = {
    wikimedia: 'm',
    wikipedia_en: 'e'
};

const api_urls = {
    'm': 'https://commons.wikimedia.org/w/api.php',
    'e': 'https://en.wikipedia.org/w/api.php', 
};

async function getImageUrl(title, src) {
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
        let filename = res.data.expandtemplates.wikitext;
        return axios.get(api_urls[src], {
            params: {
                action: 'query',
                format: 'json',
                formatversion: 2,
                prop: 'imageinfo',
                iiprop: 'url',
                titles: `Image:${filename}`
            }
        })
    })
    .then(res => {
        return res.data.query.pages[0].imageinfo[0].url;
    })
    .catch(err => {
        console.log(err);
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
                prop: '',
                summary: content
            }
        })
    })
    .then(res => {
        let caption = res.data.parse.parsedsummary.replaceAll('\\', '')
        switch(src) {
        case IMG_SRCS.wikimedia:
             caption = caption.replaceAll('href="/wiki', 'href="https://commons.wikimedia.org/wiki');
            break;
        case IMG_SRCS.wikipedia_en:
            caption = caption.replaceAll('href="/wiki', 'href="https://en.wikipedia.org/wiki');
            break;
        }
        return caption;
    })
    .catch(err => {
        console.log(err);
    });
    return res;
}

async function getPOTD(date, src) {
    let template_content = '';
    let img_url = '';
    let img_caption = '';
    switch(src) {
    case IMG_SRCS.wikimedia:
        template_content = `Potd/${ date.toISOString().split('T')[0] }`;
        img_url = await getImageUrl(`{{${template_content}}}`, src);
        img_caption = await getImageCaption(`{{${template_content} (en)}}`, src);
        break;
    case IMG_SRCS.wikipedia_en:
        template_content = `POTD/${ date.toISOString().split('T')[0] }`;
        img_url = await getImageUrl(`{{${template_content}|image}}`, src);
        img_caption = await getImageCaption(`{{${template_content}|caption}}`, src);
        break;
    }
    let segments = img_url.split('/');
    segments.splice(5, 0, 'thumb');
    segments.push(`1024px-${segments[8]}`);
    img_url = segments.join('/');
    return { img_url, img_caption }
}

module.exports = { getPOTD, IMG_SRCS };
