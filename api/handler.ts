import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';

import * as action from '#action/index.js';
import { SOURCE_NAMES } from '#types/index.js';
import * as user from '#user/index.js';
import * as utils from '#utils/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { body, query } = req;

        if (!query.key || query.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        if (!process.env.TG_TOKEN) {
            throw new Error('TG_TOKEN is not set');
        }

        const bot = new Telegraf(process.env.TG_TOKEN);

        bot.start(action.start);

        bot.help(action.replyHelp);
        bot.hears('📝 Show me the command list.', action.replyHelp);

        bot.command('pic', ctx =>
            action.replyPotd(ctx, utils.today()));
        bot.hears("🌄 Send me today's picture.", ctx =>
            action.replyPotd(ctx, utils.today()));

        bot.command('rand', ctx =>
            action.replyPotd(ctx, utils.randDate(new Date(2007, 0, 1), new Date())));
        bot.hears('🎲 Send me a random picture.', ctx =>
            action.replyPotd(ctx, utils.randDate(new Date(2007, 0, 1), new Date())));

        bot.command('sub', action.subscribe);
        bot.hears('🔔 Subscribe', action.subscribe);

        bot.command('unsub', action.unsubscribe);
        bot.hears('🔕 Unsubscribe', action.unsubscribe);

        bot.command('about', action.replyAbout);
        bot.hears('ℹ  About the bot', action.replyAbout);

        for (const [pic_src, src_name] of SOURCE_NAMES) {
            bot.hears(`🗃 Source: ${src_name}`, async ctx =>
                action.setPicSource(ctx, pic_src));
        }

        bot.action(/more.*/, action.replyFullCaption);

        await user.connect_db();
        await bot.handleUpdate(body);
        await user.disconnect_db();

        res.status(200).send('OK');
    } catch (err) {
        console.error('Error occurred in handler.');
        console.error(err);
        res.status(500).send('Internal Server Error!');
    }
}
