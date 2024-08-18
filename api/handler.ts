import { Telegraf, Markup } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { callbackQuery } from 'telegraf/filters';
import type { Context } from 'telegraf';

import * as wiki from '#wiki/index.js';
import * as user from '#user/index.js';

// Utilities
function getRandomDate(begin: Date, end: Date) {
    return new Date(begin.getTime() + Math.random() * (end.getTime() - begin.getTime()));
}

function getMenu(subscribed: boolean, src: wiki.PicSource) {
    const menu = Markup.keyboard([
        [{ text: "🌄 Send me today's picture." },   { text: '🎲 Send me a random picture.' }],
        [{ text: '🔔 Subscribe' },                  { text: '🗃 Source: en.wikipedia.org' }],
        [{ text: '📝 Show me the command list.' },  { text: 'ℹ  About the bot' }]
    ]).resize();
    if (subscribed) {
        menu.reply_markup.keyboard[1][0] = { text: '🔕 Unsubscribe' };
    }
    if (src === wiki.PicSource.WIKIPEDIA_EN) {
        menu.reply_markup.keyboard[1][1] = { text: '🗃 Source: commons.wikimedia.org' };
    }
    return menu;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const help_list = `Hope this can help you!
/start: open the menu
/pic: send me picture of the day
/rand: send me a picture of a random date (since Jan. 1, 2007)
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day
/help: show a list of available commands
/about: detailed information about the bot`;

    // Send Today's Picture
    const f_pic = async (ctx: Context) => {
        try {
            const date = new Date().toISOString().split('T')[0];
            const pic_src = await user.getPicSource(ctx.message!.from.id);
            if (pic_src === null) throw new Error('picture source is null');
            const img_url = await wiki.getUrlOfPotd(date, pic_src);
            const img_caption = await wiki.getCaptionOfPotd(date, pic_src);
            ctx.replyWithPhoto(img_url, {
                caption: img_caption,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Show Credit',
                        callback_data: `credit ${date} ${pic_src}`
                    }]]
                }
            });
        } catch (err) {
            ctx.reply('An error occurred internally!');
            console.error(err.message);
        }
    };

    // Send a Random Picture
    const f_rand = async (ctx: Context) => {
        try {
            const date = getRandomDate(new Date(2007, 0, 1), new Date())
                .toISOString().split('T')[0];

            const pic_src = await user.getPicSource(ctx.message!.from.id);
            if (pic_src === null) throw new Error(`Picture source of User ${ctx.message!.from.id} is missing`);

            const img_url = await wiki.getUrlOfPotd(date, pic_src);
            const img_caption = await wiki.getCaptionOfPotd(date, pic_src);

            ctx.replyWithPhoto(img_url, {
                caption: `[${date}]\n${img_caption}`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Show Credit',
                        callback_data: `credit ${date} ${pic_src}`
                    }]]
                }
            });
        } catch (err) {
            ctx.reply('An error occurred internally!');
            console.error(err.message);
        }
    };

    // Subscribe
    const f_sub = async (ctx: Context) => {
        const user_id = ctx.message.from.id;
        if (await user.subscribe(user_id)) {
            const menu = getMenu(true, await user.getPicSource(user_id));
            ctx.reply('Great! I will send you picture of the day at 8:00 a.m. (UTC+8) every day.', menu);
        } else {
            ctx.reply('Already subscribed!');
        }
    }

    // Unsubscribe
    const f_unsub = async (ctx: Context) => {
        const user_id = ctx.message.from.id;
        if (await user.unsubscribe(user_id)) {
            const menu = getMenu(false, await user.getPicSource(user_id));
            ctx.reply('Got it! I will not send you pictures unless you ask for it.', menu);
        } else {
            ctx.reply('You have not subscribed!');
        }
    }

    // About
    const f_about = (ctx: Context) => {
        ctx.replyWithMarkdownV2(`__*Dokodemo Door Bot*__
This is a hobby project started by Alan Kuan in 2021\\.
All sent photos were shot or uploaded by contributors on [Wikipedia](https://en.wikipedia.org) \
and [Wikimedia Commons](https://commons.wikimedia.org)\\.
Source Code: [dokodemo\\-door\\-bot](https://github.com/Alan-Kuan/dokodemo-door-bot)
License: [The MIT License](https://github.com/Alan-Kuan/dokodemo-door-bot/blob/master/LICENSE)`, {
            link_preview_options: {
                is_disabled: true,
            },
        });
    }

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

        bot.start(async ctx => {
            const user_id = ctx.message.from.id;

            if (await user.exists(user_id) && await user.hasBlockedBot(user_id)) {
                await user.setUnblockedBot(user_id);
            } else {
                await user.add(user_id);
            }

            const pic_source = await user.getPicSource(user_id);
            const menu = getMenu(await user.hasSubscribed(user_id), pic_source);
            ctx.reply("Let's find out something interesting!", menu);
        });

        bot.help(ctx => ctx.reply(help_list));
        bot.hears('📝 Show me the command list.', ctx => ctx.reply(help_list));

        bot.command('pic', f_pic);
        bot.hears("🌄 Send me today's picture.", f_pic);

        bot.command('rand', f_rand);
        bot.hears("🎲 Send me a random picture.", f_rand);

        bot.command('sub', f_sub);
        bot.hears('🔔 Subscribe', f_sub);

        bot.command('unsub', f_unsub);
        bot.hears('🔕 Unsubscribe', f_unsub);

        bot.command('about', f_about);
        bot.hears('ℹ  About the bot', f_about);

        bot.hears('🗃 Source: en.wikipedia.org', async ctx => {
            const user_id = ctx.message.from.id;
            await user.setPicSource(user_id, wiki.PicSource.WIKIPEDIA_EN);
            const menu = getMenu(await user.hasSubscribed(user_id), wiki.PicSource.WIKIPEDIA_EN);
            ctx.reply("Let's see pictures from en.wikipedia.org.", menu);
        });
        bot.hears('🗃 Source: commons.wikimedia.org', async ctx => {
            const user_id = ctx.message.from.id;
            await user.setPicSource(user_id, wiki.PicSource.WIKIMEDIA_COMMONS);
            const menu = getMenu(await user.hasSubscribed(user_id), wiki.PicSource.WIKIMEDIA_COMMONS);
            ctx.reply("Let's see pictures from commons.wikimedia.org.", menu);
        });

        bot.action(/credit.*/, async (ctx: Context) => {
            if (!ctx.has(callbackQuery('data'))) return;

            const tokens = ctx.callbackQuery.data.split(' ');
            const date = tokens[1];
            const src = tokens[2];
            const credit = await wiki.getCreditOfPotd(date, parseInt(src, 10));

            ctx.editMessageCaption(credit, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Show Caption',
                        callback_data: `caption ${date} ${src}`
                    }]]
                }
            })
        });

        bot.action(/caption.*/, async (ctx: Context) => {
            if (!ctx.has(callbackQuery('data'))) return;

            const tokens = ctx.callbackQuery.data.split(' ');
            const date = tokens[1];
            const src = tokens[2];
            const caption = await wiki.getCaptionOfPotd(date, parseInt(src, 10));

            ctx.editMessageCaption(`[${date}]\n${caption}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Show Credit',
                        callback_data: `credit ${date} ${src}`
                    }]]
                }
            })
        });

        await user.connect_db();
        await bot.handleUpdate(body);
        await user.disconnect_db();

        res.status(200).send('OK');
    } catch (err) {
        console.error('Error occurred in handler.');
        console.error(err.message);
        res.status(500).send('Internal Server Error!');
    }
}
