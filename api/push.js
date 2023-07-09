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
        let subscriber_ids_by_pic_source = [];

        await user.connect_db();
        for (const pic_source of Object.values(wiki.PIC_SOURCES)) {
            const subscriber_ids = await user.getSubscribersByPicSource(pic_source);
            subscriber_ids_by_pic_source.push(subscriber_ids);
        }
        await user.disconnect_db();

        let msgs = [];

        for (const [pic_source, subscriber_ids] of subscriber_ids_by_pic_source.entries()) {
            if (subscriber_ids.length === 0) {
                continue;
            }

            const date = new Date().toISOString().split('T')[0];
            const img_url = await wiki.getUrlOfPotd(date, pic_source);
            const img_caption = await wiki.getCaptionOfPotd(date, pic_source);
            const callback_data = `credit ${date} ${pic_source}`;
            let all_succ = true;

            for (const user_id of subscriber_ids) {
                msgs.push(
                    tg.sendPhoto(user_id, img_url, {
                            caption: img_caption,
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [[{
                                    text: 'Show Credit',
                                    callback_data,
                                }]]
                            }
                        })
                        .catch(async err => {
                            if (err.description === 'Forbidden: bot was blocked by the user') {
                                await user.setBlockedBot(user_id);
                            } else {
                                console.error(`Error occurred when sending a photo to '${user_id}'.`);
                                console.error(err);
                            }
                            all_succ = false;
                        })
                    );
            }
        }

        await Promise.all(msgs);

        if (!all_succ) {
            throw new Error('Some messages failed to be sent.');
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('Error occurred in handler.');
        console.error(err);
        res.status(500).send('Internal Server Error!');
    }
}
