import type { Context, Telegram } from 'telegraf';

import { craftExtraPhoto } from '#action/utils.js';
import type { Picture } from '#types/index.js';
import * as user from '#user/index.js';
import * as wiki from '#wiki/index.js';

export async function replyPotd(ctx: Context, date: string) {
    try {
        const pic_src = await user.getPicSource(ctx.message!.from.id);
        if (pic_src === null) throw new Error('picture source is null');

        const pic = await wiki.getPotd(date, pic_src);

        await ctx.replyWithPhoto(pic.url, craftExtraPhoto(pic));
    } catch (err) {
        await ctx.reply('An error occurred internally!');
        console.error(err.message);
    }
}

export async function sendPicture(bot: Telegram, user_id: number, pic: Picture) {
    return bot.sendPhoto(user_id, pic.url, craftExtraPhoto(pic))
        .catch(async err => {
            switch (err.response.description) {
                case 'Forbidden: bot was blocked by the user':
                    if (await user.setBlockedBot(user_id)) return;
                    console.error(`Failed to mark the bot is blocked by the user: ${user_id}.`);
                    break;
                case 'Forbidden: user is deactivated':
                    if (await user.unsubscribe(user_id)) return;
                    console.error(`Failed to unsubscribe for the user: ${user_id}.`);
                    break;
                default:
                    console.error(`An error occurred while sending a picture to the user: '${user_id}'.`);
                    console.error(err);
            }
        });
}
