import { Telegram } from 'telegraf';
import { getUrlOfPotd, getCaptionOfPotd, IMG_SRCS } from '../lib/wiki/index.js';
import { getSubscribers, unsubscribe } from '../lib/subscription.js';
import { removeImgSource } from '../lib/user_preference.js';

export default async function handler(req, res) {
    try {
        const { body } = req;
        if (!body || !body.key || body.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        const tg = new Telegram(process.env.TG_TOKEN);

        for (let key of Object.keys(IMG_SRCS)) {
            let date = new Date().toISOString().split('T')[0];
            let src = IMG_SRCS[key];
            let img_url = await getUrlOfPotd(date, src);
            let img_caption = await getCaptionOfPotd(date, src);
            let subscribers = await getSubscribers(src);
            for (let sub_id of subscribers) {
                tg.sendPhoto(sub_id, img_url, {
                        caption: img_caption,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [[{
                                text: 'Show Credit',
                                callback_data: `credit ${date} ${src}`
                            }]]
                        }
                    })
                    .catch(err => {
                        if (err.description == 'Forbidden: bot was blocked by the user') {
                            unsubscribe(sub_id);
                            removeImgSource(sub_id);
                        } else {
                            throw err;
                        }
                    });
            }
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('Error occurred in handler.');
        console.log(err.toString());
        res.status(500).send('Internal Server Error!');
    }
}
