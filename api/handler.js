'use strict';

const { Telegraf, Markup } = require('telegraf');
const { getPOTD, IMG_SRCS } = require('../src/wiki.js');
const { haveSubscribed, subscribe, unsubscribe } = require('../src/subscription.js');
const { getImgSource, setImgSource } = require('../src/user_preference.js');

// Utilities
function getRandomDate(begin, end) {
    return new Date(begin.getTime() + Math.random() * (end.getTime() - begin.getTime()));
}

module.exports = async (req, res) => {

    const help_list = `Hope this can help you!
/pic: send me picture of the day
/rand: send me a picture of a random date (since Jan. 1, 2007)
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day`;

    // Menu
    const menu = Markup.keyboard([
        [{ text: "Send me today's picture." }, { text: "Send me a random picture." }],
        [{ text: '🔔Subscribe' }, { text: 'Show me the list of commands.' }],
        [{ text: 'Source: en.wikipedia.org' }]
    ]).resize();

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

    // Subscribe
    const f_sub = async ctx => {
        if(await subscribe(ctx.message.from.id)) {
            menu.reply_markup.keyboard[1][0] = { text: '🔕Unsubscribe' };
            ctx.reply('Successfully subscribed!', menu);
        } else {
            ctx.reply('Already subscribed!');
        }
    }

    // Unsubscribe
    const f_unsub = async ctx => {
        if(await unsubscribe(ctx.message.from.id)) {
            ctx.reply('Successfully unsubscribed!', menu);
        } else {
            ctx.reply('Have not subscribe!');
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
            if(await haveSubscribed(ctx.message.from.id)) {
                menu.reply_markup.keyboard[1][0] = { text: '🔕Unsubscribe' };
            }
            ctx.reply("Let's find out something interesting!", menu);
        });

        bot.help(ctx => ctx.reply(help_list));
        bot.hears('Show me the list of commands.', ctx => ctx.reply(help_list));

        bot.command('pic', f_pic);
        bot.hears("Send me today's picture.", f_pic);

        bot.command('rand', f_rand);
        bot.hears("Send me a random picture.", f_rand);

        bot.command('sub', f_sub);
        bot.hears('🔔Subscribe', f_sub);

        bot.command('unsub', f_unsub);
        bot.hears('🔕Unsubscribe', f_unsub);

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
