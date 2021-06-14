'use strict';

const { Telegraf } = require('telegraf');
const { getPOTD } = require('../src/wiki.js');
const { subscribe, unsubscribe } = require('../src/subscription.js');

module.exports = async (req, res) => {

    try {
        const { body } = req;
        const bot = new Telegraf(process.env.TG_TOKEN);

        const help_list = `Hope this can help you!
/pic: send me picture of the day
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day`;

        bot.start(ctx => ctx.reply(help_list));

        bot.command('help', ctx => ctx.reply(help_list));

        bot.command('pic', async ctx => {
            let { img_url, img_caption } = await getPOTD();
            ctx.replyWithPhoto(img_url, { caption: img_caption });
        });

        bot.command('sub', async ctx => {
            let chat_id = String(ctx.message.chat.id);
            if(await subscribe(chat_id)) {
                ctx.reply('Successfully subscribed!');
            } else {
                ctx.reply('Already subscribed!');
            }
        });

        bot.command('unsub', async ctx => {
            let chat_id = String(ctx.chat.id);
            if(await unsubscribe(chat_id)) {
                ctx.reply('Successfully unsubscribed!');
            } else {
                ctx.reply('Have not subscribed!');
            }
        });

        await bot.handleUpdate(body);

        res.status(200).send('OK');

    } catch(err) {
        console.error('Error occurred in handler.');
        console.log(err.toString());
        res.status(500).send('Internal Server Error!');
    }

};
