import { User } from '#user/models.js';
import type { PicSource } from '#types/index.js';

export async function hasSubscribed(user_id: number) {
    const filter = { user_id, subscribed: true };

    const subed = await User.findOne(filter)
        .then(subscriber => subscriber !== null)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return subed;
}

export async function subscribe(user_id: number) {
    const filter = { user_id, subscribed: false };
    const update = { subscribed: true, receiving_hour: 8 };

    const updated = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return updated;
}

export async function unsubscribe(user_id: number) {
    const filter = { user_id, subscribed: true };
    const update = { subscribed: false, $unset: { receiving_hour: 1 } };

    const updated = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return updated;
}

export async function getSubscribersByPicSource(pic_source: PicSource) {
    const filter: { pic_source: PicSource, subscribed: boolean, blocked_bot?: boolean }
        = { pic_source, subscribed: true, blocked_bot: undefined };

    const subscriber_ids = await User.find(filter)
        .then(subscribers => {
            return subscribers.map(subscriber => subscriber.user_id);
        })
        .catch((err): number[] => {
            console.error(err.message);
            return [];
        });

    return subscriber_ids;
}
