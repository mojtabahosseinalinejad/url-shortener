/**
 * Example of using js-url-shortener with MongoDB
 *
 * To run this example, first install the required package:
 * npm install mongodb
 *
 * You need a running MongoDB server (e.g., on port 27017).
 */

import { MongoClient } from "mongodb";
import { createUrlShortener } from "../index.js";

// 1. Create a custom adapter for MongoDB
function createMongoStore(collection) {
  return {
    async set(key, value) {
      // Upsert: update if exists, create if not
      await collection.updateOne(
        { shortCode: key },
        { $set: value },
        { upsert: true },
      );
    },

    async get(key) {
      // Find document by shortCode
      return await collection.findOne({ shortCode: key });
    },

    async has(key) {
      const doc = await collection.findOne(
        { shortCode: key },
        { projection: { _id: 1 } },
      );
      return !!doc; // Convert to boolean
    },

    async delete(key) {
      await collection.deleteOne({ shortCode: key });
    },

    async update(key, updateFn) {
      // In Mongo, we first read the document, apply the update function, and save it back
      const doc = await collection.findOne({ shortCode: key });
      if (doc) {
        const updatedData = updateFn(doc);
        await collection.updateOne({ shortCode: key }, { $set: updatedData });
      }
    },
  };
}

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  console.log("Connected to MongoDB");

  const db = client.db("url_shortener_db");
  const collection = db.collection("links");

  // 2. Inject the adapter into the package
  const shortener = createUrlShortener({
    storage: createMongoStore(collection),
  });

  // 3. Standard package usage
  const code = await shortener.shorten(
    "https://mongodb.com/docs",
    "mongo-docs",
  );
  console.log("Shortened Code:", code);

  const url = await shortener.resolve("mongo-docs");
  console.log("Resolved URL:", url);

  await client.close();
}

run().catch(console.error);
