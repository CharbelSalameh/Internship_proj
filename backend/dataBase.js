require("dotenv").config();

const { MongoClient } = require("mongodb");

let dbConnection;
let client;

const url = process.env.MONGODB_URI;

module.exports = {
    connectToDb: async (cb) => {
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
        } catch (err) {
            console.error("MongoDB connection error:", err);
            cb(err);
        }
    },

    getDB: () => {
        if (!dbConnection) {
            throw new Error("Database connection has not been initialized");
        }

        return dbConnection;
    }
};