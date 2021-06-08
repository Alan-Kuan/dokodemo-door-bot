'use strict';

const { Telegram } = require('telegraf');
const { getPOTD } = require('../src/wiki.js');
const { getSubscribers } = require('../src/subscription.js');

module.exports = async (req, res) => {

    try {
        const tg = new Telegram(process.env.TG_TOKEN);
        let { img_url, img_caption } = await getPOTD();
        let subscribers = await getSubscribers();
        for(let sub_id of subscribers) {
            await tg.sendPhoto(sub_id, img_url, { caption: img_caption });
        }
    } catch(err) {
        console.error('Error occurred in handler.');
        console.log(err.toString());
    }

    res.send('OK');
};
