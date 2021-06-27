'use strict';

const { Telegraf, Markup } = require('telegraf');
const { getPOTD } = require('../src/wiki.js');
const { haveSubscribed, subscribe, unsubscribe } = require('../src/subscription.js');

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
/rand: send me a picture of a random date (since Nov. 1, 2004)
/status: check subscription status
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day`;

    // Menu
    const menu = Markup.keyboard([
        [{ text: "Send me today's picture." }, { text: "Send me a random picture." }],
        [{ text: 'Subscription' }, { text: 'Show me the list of commands.' }]
    ]).resize();

    // Subscription Menu
    const sub_menu = Markup.inlineKeyboard([[
        { text: 'Status', callback_data: 'status' },
        { text: 'Subscribe', callback_data: 'sub' },
        { text: 'Unsubscribe', callback_data: 'unsub' }
    ]]);

    // Send Today's Picture
    const f_pic = async ctx => {
        let { img_url, img_caption } = await getPOTD();
        ctx.replyWithPhoto(img_url, { caption: img_caption });
    };

    // Send a Random Picture
    const f_rand = async ctx => {
        let date = getRandomDate(new Date(2004, 10, 1), new Date());
        let { img_url, img_caption } = await getPOTD(date);
        ctx.replyWithPhoto(img_url, { caption: `[${ date.toISOString().split('T')[0] }]\n${img_caption}` });
    };

    // Subscription Status
    const f_status = async (ctx, chat_id, is_cb=false) => {
        if(await haveSubscribed(chat_id)) {
            _reply(ctx, 'You have subscribed.', is_cb);
        } else {
            _reply(ctx, 'You have not subscribe.', is_cb);
        }
    }

    // Subscribe
    const f_sub = async (ctx, chat_id, is_cb=false) => {
        if(await subscribe(chat_id)) {
            _reply(ctx, 'Successfully subscribed!', is_cb);
        } else {
            _reply(ctx, 'Already subscribed!', is_cb);
        }
    }

    // Unsubscribe
    const f_unsub = async (ctx, chat_id, is_cb=false) => {
        if(await unsubscribe(chat_id)) {
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

        bot.start(ctx => ctx.reply("Let's find out something interesting!", menu));

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

        await bot.handleUpdate(body);

        res.status(200).send('OK');
    } catch(err) {
        console.error('Error occurred in handler.');
        console.log(err.toString());
        res.status(500).send('Internal Server Error!');
    }

};
