import { Telegram } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';

import * as wiki from '#wiki/index.js';
import * as user from '#user/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { body } = req;
        if (!body || !body.key || body.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        if (!process.env.TG_TOKEN) {
            throw new Error('TG_TOKEN is not set');
        }

        const tg = new Telegram(process.env.TG_TOKEN);

        await user.connect_db();
        const subscriber_ids_by_pic_src = await Promise.all(
            Object.values(wiki.PicSource)
                .filter(v => typeof v === 'number')
                .map(async src => await user.getSubscribersByPicSource(src))
        );

        let msgs: Promise<any>[] = [];

        for (const [pic_src, subscriber_ids] of subscriber_ids_by_pic_src.entries()) {
            if (subscriber_ids.length === 0) {
                continue;
            }

            const date = new Date().toISOString().split('T')[0];
            const img_url = await wiki.getUrlOfPotd(date, pic_src);
            const img_caption = await wiki.getCaptionOfPotd(date, pic_src);
            const callback_data = `credit ${date} ${pic_src}`;

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
                        .then(() => true)
                        .catch(async err => {
                            switch (err.response.description) {
                            case 'Forbidden: bot was blocked by the user':
                                if (await user.setBlockedBot(user_id)) return;
                                console.error(`Failed to mark the bot is blocked by the user: ${user_id}.`);
                                break;
                            case 'Forbidden: user is deactivated':
                                if (await user.unsubscribe(user_id)) return;
                                console.error(`Failed to unsubscribe for the user: ${user_id}.`);
                                break;
                            default:
                                console.error(`An error occurred while pushing to the user: '${user_id}'.`);
                                console.error(err);
                            }
                        })
                    );
            }
        }

        await Promise.all(msgs);

        res.status(200).send('OK');
    } catch (err) {
        console.error('An error occurred in the handler.');
        console.error(err);
        res.status(500).send('Internal Server Error!');
    } finally {
        await user.disconnect_db();
    }
}
