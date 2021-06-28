const axios = require('axios');

async function getImageUrl(title) {
    const api_url = 'https://commons.wikimedia.org/w/api.php';
    const res = axios.get(api_url, {
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
        return axios.get(api_url, {
            params: {
                action: 'query',
                format: 'json',
                prop: 'imageinfo',
                iiprop: 'url',
                titles: `Image:${filename}`
            }
        })
    })
    .then(res => {
        let pages = res.data.query.pages;
        let key = Object.keys(pages)[0];
        let img_url = pages[key].imageinfo[0].url;
        return img_url;
    })
    .catch(err => {
        console.log(err);
    });
    return res;
}

async function getImageCaption(title) {
    const api_url = 'https://commons.wikimedia.org/w/api.php';
    const res = axios.get(api_url, {
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
        return axios.get(api_url, {
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
        let caption = res.data.parse.parsedsummary
                        .replaceAll('\\', '')
                        .replaceAll('href="/wiki', 'href="https://commons.wikimedia.org/wiki');
        return caption;
    })
    .catch(err => {
        console.log(err);
    });
    return res;
}

async function getPOTD(date = new Date()) {
    let img_url = await getImageUrl(`{{Potd/${ date.toISOString().split('T')[0] }}}`);
    let segments = img_url.split('/');
    segments.splice(5, 0, 'thumb');
    segments.push(`1000px-${segments[8]}`);
    img_url = segments.join('/');
    let img_caption = await getImageCaption(`{{Potd/${ date.toISOString().split('T')[0] } (en)}}`);
    return { img_url, img_caption }
}

module.exports = { getPOTD };
