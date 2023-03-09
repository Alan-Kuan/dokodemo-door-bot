import mongoose from 'mongoose';

const user_schema = new mongoose.Schema({
    user_id: { type: Number, required: true },
    pic_source: { type: Number, default: 0 },
    subscribed: { type: Boolean, default: false },
    receiving_hour: { type: Number },
    blocked_bot: { type: Boolean },
}, { versionKey: false });

export const User = mongoose.model('User', user_schema);
