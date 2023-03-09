import { Telegraf, Markup } from 'telegraf';
import wiki from '../lib/wiki/index.js';
import user from '../lib/user/index.js';

// Utilities
function getRandomDate(begin, end) {
    return new Date(begin.getTime() + Math.random() * (end.getTime() - begin.getTime()));
}

function getMenu(subscribed, src) {
    const menu = Markup.keyboard([
        [{ text: "🌄 Send me today's picture." }, { text: "🎲 Send me a random picture." }],
        [{ text: '🔔 Subscribe' }, { text: '🗃 Source: en.wikipedia.org' }],
        [{ text: '📝 Show me command list.' }, { text: 'ℹ About the bot' }]
    ]).resize();
    if(subscribed) {
        menu.reply_markup.keyboard[1][0] = { text: '🔕 Unsubscribe' };
    }
    if(src === wiki.IMG_SRCS.wikipedia_en) {
        menu.reply_markup.keyboard[1][1] = { text: '🗃 Source: commons.wikimedia.org' };
    }
    return menu;
}

export default async function handler(req, res) {
    const help_list = `Hope this can help you!
/start: open the menu
/pic: send me picture of the day
/rand: send me a picture of a random date (since Jan. 1, 2007)
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day
/help: show a list of available commands
/about: detailed information about the bot`;

    // Send Today's Picture
    const f_pic = async ctx => {
        try {
            let date = new Date().toISOString().split('T')[0];
            let pic_source = await user.getPicSource(ctx.message.from.id);
            let img_url = await wiki.getUrlOfPotd(date, pic_source);
            let img_caption = await wiki.getCaptionOfPotd(date, pic_source);
            ctx.replyWithPhoto(img_url, {
                caption: img_caption,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Show Credit',
                        callback_data: `credit ${date} ${pic_source}`
                    }]]
                }
            });
        } catch (err) {
            ctx.reply('An error occurred internally!');
        }
    };

    // Send a Random Picture
    const f_rand = async ctx => {
        try {
            let date = getRandomDate(new Date(2007, 0, 1), new Date())
                .toISOString().split('T')[0];
            let pic_source = await user.getPicSource(ctx.message.from.id);
            let img_url = await wiki.getUrlOfPotd(date, pic_source);
            let img_caption = await wiki.getCaptionOfPotd(date, pic_source);
            ctx.replyWithPhoto(img_url, {
                caption: `[${date}]\n${img_caption}`,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{
                        text: 'Show Credit',
                        callback_data: `credit ${date} ${pic_source}`
                    }]]
                }
            });
        } catch (err) {
            ctx.reply('An error occurred internally!');
        }
    };

    // Subscribe
    const f_sub = async ctx => {
        let user_id = ctx.message.from.id;
        if(await user.subscribe(user_id)) {
            let menu = getMenu(true, await user.getPicSource(user_id));
            ctx.reply('Great! I will send you picture of the day at 8:00 a.m. (UTC+8) every day.', menu);
        } else {
            ctx.reply('Already subscribed!');
        }
    }

    // Unsubscribe
    const f_unsub = async ctx => {
        let user_id = ctx.message.from.id;
        if(await user.unsubscribe(user_id)) {
            let menu = getMenu(false, await user.getPicSource(user_id));
            ctx.reply('Got it! I will not send you pictures unless you ask for it.', menu);
        } else {
            ctx.reply('You have not subscribed!');
        }
    }

    // About
    const f_about = ctx => {
        ctx.replyWithMarkdownV2(`__*Dokodemo Door Bot*__
This is a hobby project by Alan Kuan in 2021\\.
All sent photos were shot or uploaded by contributors on [Wikipedia](https://en.wikipedia.org) \
and [Wikimedia Commons](https://commons.wikimedia.org)\\.
Source Code: [dokodemo\\-door\\-bot](https://github.com/Alan-Kuan/dokodemo-door-bot)
License: [The MIT License](https://github.com/Alan-Kuan/dokodemo-door-bot/blob/master/LICENSE)`, {
            disable_web_page_preview: true
        });
    }

    try {
        const { body, query } = req;

        if(!query.key || query.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        const bot = new Telegraf(process.env.TG_TOKEN);

        bot.start(async ctx => {
            let user_id = ctx.message.from.id;

            if (await user.hasBlockedBot(user_id)) {
                await user.setUnBlockedBot(user_id);
            } else {
                await user.addUser(user_id);
            }
            
            let pic_source = await user.getPicSource(user_id);
            let menu = getMenu(await user.hasSubscribed(user_id), pic_source);
            ctx.reply("Let's find out something interesting!", menu);
        });

        bot.help(ctx => ctx.reply(help_list));
        bot.hears('📝 Show me command list.', ctx => ctx.reply(help_list));

        bot.command('pic', f_pic);
        bot.hears("🌄 Send me today's picture.", f_pic);

        bot.command('rand', f_rand);
        bot.hears("🎲 Send me a random picture.", f_rand);

        bot.command('sub', f_sub);
        bot.hears('🔔 Subscribe', f_sub);

        bot.command('unsub', f_unsub);
        bot.hears('🔕 Unsubscribe', f_unsub);

        bot.command('about', f_about);
        bot.hears('ℹ About the bot', f_about);

        bot.hears('🗃 Source: en.wikipedia.org', async ctx => {
            let user_id = ctx.message.from.id;
            await user.setPicSource(user_id, wiki.IMG_SRCS.wikipedia_en);
            let menu = getMenu(await user.hasSubscribed(user_id), wiki.IMG_SRCS.wikipedia_en);
            ctx.reply("Let's see pictures from en.wikipedia.org.", menu);
        });
        bot.hears('🗃 Source: commons.wikimedia.org', async ctx => {
            let user_id = ctx.message.from.id;
            await user.setPicSource(user_id, wiki.IMG_SRCS.wikimedia_commons);
            let menu = getMenu(await user.hasSubscribed(user_id), wiki.IMG_SRCS.wikimedia_commons);
            ctx.reply("Let's see pictures from commons.wikimedia.org.", menu);
        });

        bot.action(/credit.*/, async ctx => {
            let tokens = ctx.callbackQuery.data.split(' ');
            let date = tokens[1];
            let src = tokens[2];
            let credit = await wiki.getCreditOfPotd(date, src);
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

        bot.action(/caption.*/, async ctx => {
            let tokens = ctx.callbackQuery.data.split(' ');
            let date = tokens[1];
            let src = tokens[2];
            let caption = await wiki.getCaptionOfPotd(date, src);
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

        user.connect_db();
        await bot.handleUpdate(body);
        await user.disconnect_db();

        res.status(200).send('OK');
    } catch(err) {
        console.error('Error occurred in handler.');
        console.error(err.message);
        res.status(500).send('Internal Server Error!');
    }
}
