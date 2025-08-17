import { Markup } from 'telegraf';
import type { Types } from 'telegraf';

import { PicSource } from '#types/index.js';
import type { Picture } from '#types/index.js';
import * as utils from '#utils/index.js';

export function craftMenu(subscribed: boolean, pic_src: PicSource) {
    const menu = Markup.keyboard([
        [{ text: "🌄 Send me today's picture." },   { text: '🎲 Send me a random picture.' }],
        [{ text: '🔔 Subscribe' },                  { text: '🗃 Source: en.wikipedia.org' }],
        [{ text: '📝 Show me the command list.' },  { text: 'ℹ  About the bot' }]
    ]).resize();

    if (subscribed) {
        menu.reply_markup.keyboard[1][0] = { text: '🔕 Unsubscribe' };
    }

    if (pic_src === PicSource.WIKIPEDIA_EN) {
        menu.reply_markup.keyboard[1][1] = { text: '🗃 Source: commons.wikimedia.org' };
    }

    return menu;
}

export function craftExtra(pic: Picture) {
    let extra: Types.ExtraPhoto | Types.ExtraVideo = { parse_mode: 'HTML' };
    const date_part = `[${pic.date}]\n\n`;
    const credit_part = `\n\n${pic.credit}`;

    // NOTE: character limit of photo/video caption is 1024
    const len_limit = 1024 - date_part.length - credit_part.length;
    const res = utils.paginate(pic.caption, len_limit, []);

    if (res.end_idx < pic.caption.length) {
        extra.caption = date_part + `${res.paginated_html}...` + credit_part;

        extra.reply_markup = {
            inline_keyboard: [[{
                text: 'More',
                callback_data: `more ${pic.date} ${pic.src} ${len_limit}`,
            }]]
        };
    } else {
        extra.caption = date_part + pic.caption + credit_part;
    }

    return extra;
}
