import type { Context, Telegram } from 'telegraf';

import { craftExtraPhoto, craftMediaGroup, craftMediaGroupMessage } from '#action/utils.js';
import type { Potd, Picture } from '#types/index.js';
import { getPicSource, setBlockedBot, unsubscribe } from '#user/index.js';
import { getPotd } from '#wiki/index.js';

// size <= 5 MB (5,242,880 bytes)
// width + height <= 10,000
// width / height <= 20
function isValidPhoto(picture: Picture) {
    return picture.size <= 5_242_880 &&
        picture.width + picture.height <= 10_000 &&
        picture.width / picture.height <= 20;
}

export async function replyPotd(ctx: Context, date: string) {
    try {
        const pic_src = await getPicSource(ctx.message!.from.id);
        if (pic_src === null) throw new Error('picture source is null');

        const potd = await getPotd(date, pic_src);
        const valid_pictures = potd.pictures.filter(picture => isValidPhoto(picture));

        if (valid_pictures.length === 0) {
            await ctx.reply(`Today's picture is either too large or too wide.\n${potd.page_url}`);
        } else if (valid_pictures.length === 1) {
            await ctx.replyWithPhoto(valid_pictures[0].url, craftExtraPhoto(potd));
        } else {
            await ctx.replyWithMediaGroup(craftMediaGroup(valid_pictures));
            await ctx.reply(...craftMediaGroupMessage(potd));
        }
    } catch (err) {
        console.error(err);
        await ctx.reply('Oops! An error occurred internally!');
    }
}

export async function sendPotd(bot: Telegram, user_id: number, potd: Potd) {
    try {
        const valid_pictures = potd.pictures.filter(picture => isValidPhoto(picture));

        if (valid_pictures.length === 0) {
            await bot.sendMessage(user_id, `Today's picture is either too large or too wide.\n${potd.page_url}`);
        } else if (valid_pictures.length === 1) {
            await bot.sendPhoto(user_id, valid_pictures[0].url, craftExtraPhoto(potd));
        } else {
            await bot.sendMediaGroup(user_id, craftMediaGroup(valid_pictures));
            await bot.sendMessage(user_id, ...craftMediaGroupMessage(potd));
        }
    } catch (err) {
        switch (err.response?.description) {
            case 'Forbidden: bot was blocked by the user':
                if (await setBlockedBot(user_id)) return;
                console.error(`Failed to mark the bot is blocked by the user: ${user_id}.`);
                break;
            case 'Forbidden: user is deactivated':
                if (await unsubscribe(user_id)) return;
                console.error(`Failed to unsubscribe for the user: ${user_id}.`);
                break;
            default:
                console.error(`An error occurred while sending a picture to the user: '${user_id}'.`);
                console.error(err);
        }
        await bot.sendMessage(user_id, "Oops! An error occurred internally while sending today's picture to you.");
    }
}
