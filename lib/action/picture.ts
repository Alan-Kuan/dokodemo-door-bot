import type { Context, Telegram } from 'telegraf';

import { craftExtra } from '#action/utils.js';
import type { Picture } from '#types/index.js';
import * as user from '#user/index.js';
import * as wiki from '#wiki/index.js';

function isVideo(pic: Picture) {
    return pic.url.endsWith('webm');
}

export async function replyPotd(ctx: Context, date: string) {
    try {
        const pic_src = await user.getPicSource(ctx.message!.from.id);
        if (pic_src === null) throw new Error('picture source is null');

        const pic = await wiki.getPotd(date, pic_src);
        const action = isVideo(pic) ?
            ctx.replyWithVideo(pic.url, craftExtra(pic)) :
            ctx.replyWithPhoto(pic.url, craftExtra(pic));

        await action;
    } catch (err) {
        await ctx.reply('An error occurred internally!');
        console.error(err.message);
    }
}

export async function sendPicture(bot: Telegram, user_id: number, pic: Picture) {
    try {
        const action = isVideo(pic) ?
            bot.sendVideo(user_id, pic.url, craftExtra(pic)) :
            bot.sendPhoto(user_id, pic.url, craftExtra(pic));
        await action;
    } catch (err) {
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
    }
}
