import type { Context } from 'telegraf';
import { callbackQuery } from 'telegraf/filters';

import { paginate } from '#utils/index.js';
import { getCaptionByDate } from '#wiki/index.js';

function safeParseInt(str: string, fallback: number) {
    const parsed = parseInt(str, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
}

export async function replyFullCaption(ctx: Context) {
    if (!ctx.has(callbackQuery('data'))) return;

    const tokens = ctx.callbackQuery.data.split(' ');
    const date = tokens[1];
    const src = safeParseInt(tokens[2], 0);
    const len_limit = safeParseInt(tokens[3], 960);
    let caption = await getCaptionByDate(date, src);

    let res = paginate(caption, len_limit, []);
    caption = caption.slice(res.end_idx);
    do {
        // NOTE: character limit of regular text message is 4096
        res = paginate(caption, 4096, res.unclosed_tags);
        caption = caption.slice(res.end_idx);
        await ctx.replyWithHTML(res.paginated_html);
    } while (caption.length > 0);

    // remove the button
    ctx.editMessageReplyMarkup({ inline_keyboard: [] });
}
