import mongoose, { Connection } from 'mongoose';

/**
 * @fileoverview Database connection utilities for managing a singleton
 * MongoDB connection throughout the application.
 *
 * @author ejparnell
 * @since 1.0.0
 */

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error('MONGODB_URI missing in env');

declare global {
    /**
     * Cached Mongoose connection reference stored in the global scope to
     * prevent creating multiple connections in a serverless environment.
     */
    var mongooseConn: {
        /** Active Mongoose connection instance. */
        conn: Connection | null;
        /** Promise resolving to a connection, used while connecting. */
        promise: Promise<Connection> | null;
    };
}

/**
 * Establishes a connection to MongoDB using Mongoose. The connection is
 * cached on the `global` object to ensure a single instance is reused
 * across hot reloads and serverless invocations.
 *
 * @returns A promise that resolves to an active {@link Connection}.
 */
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
