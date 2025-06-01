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
    let caption = `[${pic.date}]\n\n`;
    // NOTE: character limit of photo/video caption is 1024
    const res = utils.paginate(pic.caption, 960, []);

    if (res.end_idx < pic.caption.length) {
        caption += `${res.paginated_html}...`;

        extra.reply_markup = {
            inline_keyboard: [[{
                text: 'More',
                callback_data: `more ${pic.date} ${pic.src}`,
            }]]
        };
    } else {
        caption += pic.caption;
    }
    caption += `\n\n${pic.credit}`;

    extra.caption = caption;
    return extra;
}
