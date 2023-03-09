import { User } from './models.js';

export async function hasSubscribed(user_id) {
    const filter = { user_id, subscribed: true };

    const subed = await User.findOne(filter)
        .then(subscriber => subscriber !== null)
        .catch(err => {
            console.err(err.message);
            return false;
        });

    return subed;
}

export async function subscribe(user_id) {
    const filter = { user_id, subscribed: false };
    const update = { user_id, subscribed: true, receiving_hour: 8 };

    const subed_if_has_not_subed = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return subed_if_has_not_subed;
}

export async function unsubscribe(user_id) {
    const filter = { user_id, subscribed: true };
    const update = { user_id, subscribed: false, receiving_hour: null };

    const unsubed_if_has_subed = await User.updateOne(filter, update)
        .then(res => res.modifiedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return unsubed_if_has_subed;
}

export async function getSubscribersByPicSource(pic_source) {
    const filter = { pic_source, subscribed: true, blocked_bot: undefined };

    const subscriber_ids = await User.find(filter)
        .then(subscribers => {
            return subscribers.map(subscriber => subscriber.user_id);
        })
        .catch(err => {
            console.error(err.message);
            return [];
        });

    return subscriber_ids;
}
