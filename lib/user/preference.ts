import { User } from '#user/models.js';
import type { PicSource } from '#wiki/misc.js';

export async function getPicSource(user_id: number) {
    const filter = { user_id };

    const pic_source = await User.findOne(filter)
        .then(user => user?.pic_source ?? null)
        .catch(err => {
            console.error(err.message);
            return null;
        });

    return pic_source;
}

export async function setPicSource(user_id: number, pic_source: PicSource) {
    const filter = { user_id };
    const update = { pic_source };

    const updated = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return updated;
}

export async function hasBlockedBot(user_id: number) {
    const filter = { user_id, blocked_bot: true };

    const blocked = await User.findOne(filter)
        .then(user => user !== null)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return blocked;
}

export async function setBlockedBot(user_id: number) {
    const filter = { user_id };
    const update = { blocked_bot: true };

    const updated = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return updated;
}

export async function setUnblockedBot(user_id: number) {
    const filter = { user_id };
    const update = { $unset: { blocked_bot: true } };

    const updated = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return updated;
}
