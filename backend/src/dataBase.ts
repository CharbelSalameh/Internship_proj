import "dotenv/config";
import { MongoClient, type Db } from "mongodb";

let dbConnection: Db | undefined;
let client: MongoClient | undefined;

const url = process.env.MONGODB_URI;

export async function connectToDb(
  cb: (error?: unknown) => void
): Promise<void> {
  try {
    if (!url) {
      throw new Error("MONGODB_URI is missing from the .env file");
    }

    client = new MongoClient(url);

    await client.connect();

    await client.db("admin").command({ ping: 1 });

    dbConnection = client.db("users_db");

    console.log("Connected successfully to MongoDB in Docker");

    cb();
  } catch (error: unknown) {
    console.error("MongoDB connection error:", error);
    cb(error);
  }
}

export function getDB(): Db {
  if (!dbConnection) {
    throw new Error("Database connection has not been initialized");
  }

  return dbConnection;
}