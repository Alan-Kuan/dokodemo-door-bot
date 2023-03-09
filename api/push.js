import { Telegram } from 'telegraf';
import wiki from '../lib/wiki/index.js';
import user from '../lib/user/index.js';

export default async function handler(req, res) {
    try {
        const { body } = req;
        if (!body || !body.key || body.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        const tg = new Telegram(process.env.TG_TOKEN);

        user.connect_db();

        for (let key of Object.keys(wiki.IMG_SRCS)) {
            let date = new Date().toISOString().split('T')[0];
            let src = wiki.IMG_SRCS[key];
            let img_url = await wiki.getUrlOfPotd(date, src);
            let img_caption = await wiki.getCaptionOfPotd(date, src);
            let subscribers = await user.getSubscribersByPicSource(src);
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
                    .catch(async err => {
                        if (err.description == 'Forbidden: bot was blocked by the user') {
                            await user.setBlockedBot(sub_id);
                        } else {
                            throw err;
                        }
                    });
            }
        }

        await user.disconnect_db();

        res.status(200).send('OK');
    } catch (err) {
        console.error('Error occurred in handler.');
        console.error(err.message);
        res.status(500).send('Internal Server Error!');
    }
}
