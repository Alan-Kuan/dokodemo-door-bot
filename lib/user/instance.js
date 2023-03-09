import { User } from './models.js';

export async function add(user_id) {
    const filter = { user_id };
    const update = { user_id };

    const added = await User.updateOne(filter, update, { upsert: true })
        .then(res => res.upsertedCount === 1)
        .catch(err => {
            console.error(err.message);
            return false;
        });

    return added;
}
