import mongoose from "mongoose"

// Serverless-safe cached connection: survives warm Vercel invocations,
// re-connects on cold starts. Single connect attempt per invocation.
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnection() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    console.error("DB failure: MONGO_URI is not set");
    throw new Error("MONGO_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("DB connected");
  } catch (error) {
    cached.promise = null;
    console.log("DB failure", error.message);
    throw error;
  }

  return cached.conn;
}
