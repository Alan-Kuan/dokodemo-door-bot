import type { Context } from 'telegraf';
import { callbackQuery } from 'telegraf/filters';

import * as utils from '#utils/index.js';
import * as wiki from '#wiki/index.js';

export async function replyFullCaption(ctx: Context) {
    if (!ctx.has(callbackQuery('data'))) return;

    const tokens = ctx.callbackQuery.data.split(' ');
    const date = tokens[1];
    const src = tokens[2];
    const len_limit = parseInt(tokens[3]);
    let caption = await wiki.getCaptionOfPotd(date, parseInt(src, 10));

    let res = utils.paginate(caption, len_limit, []);
    caption = caption.slice(res.end_idx);
    do {
        // NOTE: character limit of regular text message is 4096
        res = utils.paginate(caption, 4096, res.unclosed_tags);
        caption = caption.slice(res.end_idx);
        await ctx.replyWithHTML(res.paginated_html);
    } while (caption.length > 0);

    // remove the button
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
}
