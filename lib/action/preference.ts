import type { Context } from 'telegraf';

import { craftMenu } from '#action/utils.js';
import { SOURCE_NAMES } from '#types/index.js';
import type { PicSource } from '#types/index.js';
import * as user from '#user/index.js';

export async function setPicSource(ctx: Context, pic_src: PicSource) {
    const user_id = ctx.message.from.id;
    const menu = craftMenu(await user.hasSubscribed(user_id), pic_src);

    await user.setPicSource(user_id, pic_src);
    await ctx.reply(`Let's see pictures from ${SOURCE_NAMES.get(pic_src)}.`, menu);
}
