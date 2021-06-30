'use strict';

const { Telegram } = require('telegraf');
const { getPOTD, IMG_SRCS } = require('../src/wiki.js');
const { getSubscribers } = require('../src/subscription.js');

module.exports = async (req, res) => {

    try {
        const { query } = req;
        if(!query.key || query.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        const tg = new Telegram(process.env.TG_TOKEN);

        for(let key of Object.keys(IMG_SRCS)) {
            let src = IMG_SRCS[key];
            let { img_url, img_caption } = await getPOTD(new Date(), src);
            let subscribers = await getSubscribers(src);
            for(let sub_id of subscribers) {
                await tg.sendPhoto(sub_id, img_url, { caption: img_caption, parse_mode: 'HTML' });
            }
        }

        res.status(200).send('OK');
    } catch(err) {
        console.error('Error occurred in handler.');
        console.log(err.toString());
        res.status(500).send('Internal Server Error!');
    }

};
