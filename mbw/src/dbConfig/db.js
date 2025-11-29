// dbConfig/db.js
import mongoose from "mongoose";
let cached = global._mongoose || { conn: null, promise: null };

export async function connectToDB() {
  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error("MONGODB_URL is missing"); // inside function, not top level
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  cached.conn = await cached.promise;
  global._mongoose = cached;
  return cached.conn;
}
