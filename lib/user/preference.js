import { User } from './models.js'

export async function getPicSource(user_id) {
    const filter = { user_id };

    const pic_source = await User.findOne(filter)
        .then(user => user ? user.pic_source : null)
        .catch(err => {
            console.error(err.message);
            return null;
        });

    return pic_source;
}

export async function setPicSource(user_id, pic_source) {
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

export async function hasBlockedBot(user_id) {
    const filter = { user_id, blocked_bot: true };

    const blocked = await User.findOne(filter)
        .then(user => user !== null)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return blocked;
}

export async function setBlockedBot(user_id) {
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

export async function setUnBlockedBot(user_id) {
    const filter = { user_id };
    const update = { $unset: { blocked_bot: 1 } };

    const updated = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return updated;
}
