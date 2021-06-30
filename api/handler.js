'use strict';

const { Telegraf, Markup } = require('telegraf');
const { getPOTD, IMG_SRCS } = require('../src/wiki.js');
const { haveSubscribed, subscribe, unsubscribe } = require('../src/subscription.js');
const { getImgSource, setImgSource } = require('../src/user_preference.js');

// Utilities
function getRandomDate(begin, end) {
    return new Date(begin.getTime() + Math.random() * (end.getTime() - begin.getTime()));
}

function _reply(ctx, msg, is_cb=false) {
    if(is_cb) {
        ctx.answerCbQuery(msg, { show_alert: true });
    } else {
        ctx.reply(msg);
    }
}

module.exports = async (req, res) => {

    const help_list = `Hope this can help you!
/pic: send me picture of the day
/rand: send me a picture of a random date (since Jan. 1, 2007)
/status: check subscription status
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day`;

    // Menu
    const menu = Markup.keyboard([
        [{ text: "Send me today's picture." }, { text: "Send me a random picture." }],
        [{ text: 'Subscription' }, { text: 'Show me the list of commands.' }],
        [{ text: 'Source: en.wikipedia.org' }]
    ]).resize();

    // Subscription Menu
    const sub_menu = Markup.inlineKeyboard([[
        { text: 'Status', callback_data: 'status' },
        { text: 'Subscribe', callback_data: 'sub' },
        { text: 'Unsubscribe', callback_data: 'unsub' }
    ]]);

    // Send Today's Picture
    const f_pic = async ctx => {
        let src = await getImgSource(ctx.message.from.id);
        let { img_url, img_caption } = await getPOTD(new Date(), src);
        ctx.replyWithPhoto(img_url, { caption: img_caption, parse_mode: 'HTML' });
    };

    // Send a Random Picture
    const f_rand = async ctx => {
        let src = await getImgSource(ctx.message.from.id);
        let date = getRandomDate(new Date(2007, 0, 1), new Date());
        let { img_url, img_caption } = await getPOTD(date, src);
        ctx.replyWithPhoto(img_url, {
            caption: `[${ date.toISOString().split('T')[0] }]\n${img_caption}`,
            parse_mode: 'HTML'
        });
    };

    // Subscription Status
    const f_status = async (ctx, user_id, is_cb=false) => {
        if(await haveSubscribed(user_id)) {
            _reply(ctx, 'You have subscribed.', is_cb);
        } else {
            _reply(ctx, 'You have not subscribe.', is_cb);
        }
    }

    // Subscribe
    const f_sub = async (ctx, user_id, is_cb=false) => {
        if(await subscribe(user_id)) {
            _reply(ctx, 'Successfully subscribed!', is_cb);
        } else {
            _reply(ctx, 'Already subscribed!', is_cb);
        }
    }

    // Unsubscribe
    const f_unsub = async (ctx, user_id, is_cb=false) => {
        if(await unsubscribe(user_id)) {
            _reply(ctx, 'Successfully unsubscribed!', is_cb);
        } else {
            _reply(ctx, 'Have not subscribe!', is_cb);
        }
    }
    
    try {
        const { body, query } = req;

        if(!query.key || query.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        const bot = new Telegraf(process.env.TG_TOKEN);

        bot.start(async ctx => {
            await setImgSource(ctx.message.from.id, IMG_SRCS.wikimedia);
            ctx.reply("Let's find out something interesting!", menu);
        });

        bot.help(ctx => ctx.reply(help_list));
        bot.hears('Show me the list of commands.', ctx => ctx.reply(help_list));

        bot.command('pic', f_pic);
        bot.hears("Send me today's picture.", f_pic);

        bot.command('rand', f_rand);
        bot.hears("Send me a random picture.", f_rand);

        bot.hears('Subscription', async ctx => ctx.reply('Pick one.', sub_menu));

        bot.command('status', async ctx => f_status(ctx, ctx.message.from.id));
        bot.action('status', async ctx => f_status(ctx, ctx.callbackQuery.from.id, true));

        bot.command('sub', async ctx => f_sub(ctx, ctx.message.from.id));
        bot.action('sub', async ctx => f_sub(ctx, ctx.callbackQuery.from.id, true));

        bot.command('unsub', async ctx => f_unsub(ctx, ctx.message.from.id));
        bot.action('unsub', async ctx => f_unsub(ctx, ctx.callbackQuery.from.id, true));

        bot.hears('Source: en.wikipedia.org', async ctx => {
            await setImgSource(ctx.message.from.id, IMG_SRCS.wikipedia_en);
            menu.reply_markup.keyboard[2][0] = { text: 'Source: commons.wikimedia.org' };
            ctx.reply("Let's see pictures from en.wikipedia.org.", menu);
        });
        bot.hears('Source: commons.wikimedia.org', async ctx => {
            await setImgSource(ctx.message.from.id, IMG_SRCS.wikimedia);
            ctx.reply("Let's see pictures from commons.wikimedia.org.", menu);
        });

        await bot.handleUpdate(body);

        res.status(200).send('OK');
    } catch(err) {
        console.error('Error occurred in handler.');
        console.log(err.toString());
        res.status(500).send('Internal Server Error!');
    }

};
