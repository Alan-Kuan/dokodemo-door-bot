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

        for (const pic_source of Object.values(wiki.IMG_SRCS)) {
            let date = new Date().toISOString().split('T')[0];
            let img_url = await wiki.getUrlOfPotd(date, pic_source);
            let img_caption = await wiki.getCaptionOfPotd(date, pic_source);
            let subscriber_ids = await user.getSubscribersByPicSource(pic_source);
            for (const user_id of subscriber_ids) {
                tg.sendPhoto(user_id, img_url, {
                        caption: img_caption,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [[{
                                text: 'Show Credit',
                                callback_data: `credit ${date} ${pic_source}`
                            }]]
                        }
                    })
                    .catch(async err => {
                        if (err.description == 'Forbidden: bot was blocked by the user') {
                            await user.setBlockedBot(user_id);
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
