import { setDefaultResultOrder } from 'node:dns';

import { Telegram } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';

import * as action from '#action/index.js';
import { PicSource } from '#types/index.js';
import * as user from '#user/index.js';
import * as utils from '#utils/index.js';
import * as wiki from '#wiki/index.js';

// FIX: https://github.com/telegraf/telegraf/issues/1961
setDefaultResultOrder('ipv6first');

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

        const bot = new Telegram(process.env.TG_TOKEN);

        await user.connect_db();

        const srcs = Object.values(PicSource)
            .filter(v => typeof v === 'number') as PicSource[];
        const subscriber_ids_by_pic_src = await Promise.all(
            srcs.map(async src => await user.getSubscribersByPicSource(src))
        );

        let actions: Promise<any>[] = [];
        for (const [pic_src, subscriber_ids] of subscriber_ids_by_pic_src.entries()) {
            if (subscriber_ids.length === 0) continue;

            const pic = await wiki.getPotd(utils.today(), pic_src);

            for (const user_id of subscriber_ids) {
                actions.push(action.sendPicture(bot, user_id, pic));
            }
        }
        await Promise.all(actions);

        res.status(200).send('OK');
    } catch (err) {
        console.error('An error occurred in the handler.');
        console.error(err);
        res.status(500).send('Internal Server Error!');
    } finally {
        await user.disconnect_db();
    }
}
