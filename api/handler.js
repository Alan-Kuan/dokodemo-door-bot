'use strict';

const { Telegraf, Markup } = require('telegraf');
const { getPOTD } = require('../src/wiki.js');
const { haveSubscribed, subscribe, unsubscribe } = require('../src/subscription.js');

function getRandomDate(begin, end) {
    return new Date(begin.getTime() + Math.random() * (end.getTime() - begin.getTime()));
}

module.exports = async (req, res) => {

    const help_list = `Hope this can help you!
/pic: send me picture of the day
/rand: send me a picture of a random date (since Nov. 1, 2004)
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day`;

    const keyboard = Markup.keyboard([
        [{ text: 'Subscription' }]
    ]).resize();

    try {
        const { body, query } = req;

        if(!query.key || query.key !== process.env.MY_API_KEY) {
            res.status(403).send('Permission Denied!');
            return;
        }

        const bot = new Telegraf(process.env.TG_TOKEN);

        bot.start(ctx => ctx.reply("Let's find out something interesting!", keyboard));

        bot.help(ctx => ctx.reply(help_list));

        bot.command('pic', async ctx => {
            let { img_url, img_caption } = await getPOTD();
            ctx.replyWithPhoto(img_url, { caption: img_caption });
        });

        bot.command('rand', async ctx => {
            let date = getRandomDate(new Date(2004, 10, 1), new Date());
            let { img_url, img_caption } = await getPOTD(date);
            ctx.replyWithPhoto(img_url, { caption: `[${ date.toISOString().split('T')[0] }]\n${img_caption}` });
        });

        bot.hears('Subscription', async ctx => {
            let chat_id = String(ctx.message.chat.id);
            let have_sub = await haveSubscribed(chat_id);
            if(have_sub) {
                ctx.reply('You have subscribed.');
            } else {
                ctx.reply('You have not subscribed.');
            }
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
