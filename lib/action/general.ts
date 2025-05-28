import type { Context } from 'telegraf';

import { craftMenu } from '#action/utils.js';
import * as user from '#user/index.js';

export async function start(ctx: Context) {
    const user_id = ctx.message.from.id;

    if (await user.exists(user_id) && await user.hasBlockedBot(user_id)) {
        await user.setUnblockedBot(user_id);
    } else {
        await user.add(user_id);
    }

    const pic_src = await user.getPicSource(user_id);
    const menu = craftMenu(await user.hasSubscribed(user_id), pic_src);

    await ctx.reply("Let's find out something interesting!", menu);
}

export async function replyHelp(ctx: Context) {
    const help = `Hope this can help you!
/start: open the menu
/pic: send me picture of the day
/rand: send me a picture of a random date (since Jan. 1, 2007)
/sub: subscribe picture of the day
/unsub: unsubscribe picture of the day
/help: show a list of available commands
/about: detailed information about the bot`;

    await ctx.reply(help);
}

export async function replyAbout(ctx: Context) {
    const about = `__*Dokodemo Door Bot*__
This is a hobby project by Alan Kuan since 2021\\. \
The purpose of the project is let one receive picture of the day from Wikipedia/Wikimedia Commons, \
and perhaps find something interesting\\.

Photos sent from this bot were shot or uploaded by contributors from [Wikipedia](https://en.wikipedia.org) \
and [Wikimedia Commons](https://commons.wikimedia.org)\\.

\\* Source Code: [dokodemo\\-door\\-bot](https://github.com/Alan-Kuan/dokodemo-door-bot)
\\* License: [The MIT License](https://github.com/Alan-Kuan/dokodemo-door-bot/blob/master/LICENSE)`;

    await ctx.replyWithMarkdownV2(about, {
        link_preview_options: {
            is_disabled: true,
        },
    });
}
