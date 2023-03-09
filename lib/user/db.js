import mongoose from 'mongoose';

export function connect_db() {
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGODB_CONN_STR);
}

export async function disconnect_db() {
    await mongoose.disconnect();
}
