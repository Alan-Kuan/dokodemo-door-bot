import type { Context } from 'telegraf';

import { craftMenu } from '#action/utils.js';
import * as user from '#user/index.js';

export async function subscribe(ctx: Context) {
    const user_id = ctx.message.from.id;

    if (await user.subscribe(user_id)) {
        const menu = craftMenu(true, await user.getPicSource(user_id));

        await ctx.reply('Great! I will send you picture of the day at 8:00 a.m. (UTC+8) every day.', menu);
    } else {
        await ctx.reply('Already subscribed!');
    }
}

export async function unsubscribe(ctx: Context) {
    const user_id = ctx.message.from.id;

    if (await user.unsubscribe(user_id)) {
        const menu = craftMenu(false, await user.getPicSource(user_id));

        await ctx.reply('Got it! I will not send you pictures unless you ask for it.', menu);
    } else {
        await ctx.reply('You have not subscribed!');
    }
}
