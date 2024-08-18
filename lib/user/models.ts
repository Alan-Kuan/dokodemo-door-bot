import { Schema, model } from 'mongoose';

interface IUser {
    user_id: number,
    pic_source?: number,
    subscribed?: boolean,
    receiving_hour?: number,
    blocked_bot?: boolean,
}

const user_schema = new Schema<IUser>({
        user_id: { type: Number, required: true },
        pic_source: { type: Number, default: 0 },
        subscribed: { type: Boolean, default: false },
        receiving_hour: { type: Number },
        blocked_bot: { type: Boolean },
    },
    {
        versionKey: false,
    });

export const User = model<IUser>('User', user_schema);
