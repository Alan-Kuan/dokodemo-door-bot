import { add, exists } from './instance.js';
import { connect_db, disconnect_db } from './db.js';

import {
    getPicSource,
    setPicSource,
    hasBlockedBot,
    setBlockedBot,
    setUnBlockedBot
} from './preference.js';

import {
    hasSubscribed,
    subscribe,
    unsubscribe,
    getSubscribersByPicSource
} from './subscription.js';


export default {
    add,
    exists,

    connect_db,
    disconnect_db,

    getPicSource,
    setPicSource,
    hasBlockedBot,
    setBlockedBot,
    setUnBlockedBot,

    hasSubscribed,
    subscribe,
    unsubscribe,
    getSubscribersByPicSource,
};
