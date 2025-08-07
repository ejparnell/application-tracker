import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error('MONGODB_URI missing in env');

declare global {
    // eslint-disable-next-line no-var
    var mongooseConn: {
        conn: Connection | null;
        promise: Promise<Connection> | null;
    };
}

export async function dbConnect(): Promise<Connection> {
    if (global.mongooseConn?.conn) return global.mongooseConn.conn;

    if (!global.mongooseConn) {
        global.mongooseConn = { conn: null, promise: null };
    }

    if (!global.mongooseConn.promise) {
        global.mongooseConn.promise = mongoose
            .connect(MONGODB_URI, { bufferCommands: false })
            .then((mongoose) => mongoose.connection);
    }

    global.mongooseConn.conn = await global.mongooseConn.promise;
    return global.mongooseConn.conn;
}
