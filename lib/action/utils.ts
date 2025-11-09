import { Markup, type Types } from 'telegraf';

import { PicSource, type Picture, type Potd } from '#types/index.js';
import { paginate } from '#utils/index.js';

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

export function craftExtraPhoto(potd: Potd): Types.ExtraPhoto {
    const res = makeCaption(potd);

    return {
        parse_mode: 'HTML',
        caption: res.caption,
        reply_markup: res.too_long ? {
            inline_keyboard: [[{
                text: 'More',
                callback_data: `more ${potd.date} ${potd.src} ${res.len_limit}`,
            }]]
        } : undefined,
    };
}

export function craftMediaGroup(pictures: Picture[]): Types.MediaGroup {
    return pictures.map(picture => ({ type: 'photo', media: picture.url }));
}

export function craftMediaGroupMessage(potd: Potd): [string, Types.ExtraReplyMessage] {
    const res = makeCaption(potd);

    const extra: Types.ExtraReplyMessage = {
        link_preview_options: {
            is_disabled: true,
        },
        parse_mode: 'HTML',
        reply_markup: res.too_long ? {
            inline_keyboard: [[{
                text: 'More',
                callback_data: `more ${potd.date} ${potd.src} ${res.len_limit}`,
            }]]
        } : undefined,
    };

    return [res.caption, extra];
}

function makeCaption(potd: Potd) {
    const date_part = `[${potd.date}]\n\n`;
    const credit_part = `\n\n${potd.credit}`;

    // NOTE: character limit of a caption is 1024
    const len_limit = 1024 - date_part.length - credit_part.length;
    const res = paginate(potd.caption, len_limit, []);

    const too_long = res.end_idx < potd.caption.length;
    const caption = date_part +
        (too_long ? `${res.paginated_html}...` : potd.caption) +
        credit_part;

    return { too_long, caption, len_limit };
}
