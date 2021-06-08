const axios = require('axios');
const cheerio = require('cheerio');

async function getImageUrl(title) {
    const api_url = 'https://commons.wikimedia.org/w/api.php';
    const res = axios.get(api_url, {
        params: {
            action: 'query',
            format: 'json',
            formatversion: 2,
            prop: 'images',
            titles: title
        }
    })
    .then(res => {
        let filename = res.data.query.pages[0].images[0].title;
        return axios.get(api_url, {
            params: {
                action: 'query',
                format: 'json',
                prop: 'imageinfo',
                iiprop: 'url',
                titles: filename
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
    const webpage_url = `https://commons.wikimedia.org/wiki/${title}`
    const res = axios.get(webpage_url)
        .then(res => {
            let $ = cheerio.load(res.data);
            return $('.thumbcaption').children('.description').text();
        })
        .catch(err => {
            console.log(err);
        });
    return res;
}

async function getPOTD(date = new Date()) {
    let title = `Template:Potd/${ date.toISOString().split('T')[0] }`;
    let img_url = await getImageUrl(title);
    let segments = img_url.split('/');
    segments.splice(5, 0, 'thumb');
    segments.push(`1000px-${segments[8]}`);
    img_url = segments.join('/');
    let img_caption = await getImageCaption(`${title}_(en)`);
    return { img_url, img_caption }
}

module.exports = { getPOTD };
