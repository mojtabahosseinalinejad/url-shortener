/**
 * Example of using js-url-shortener with Redis
 *
 * To run this example, first install the required package:
 * npm install redis
 *
 * You need a running Redis server (e.g., on port 6379).
 */

import { createClient } from "redis";
import { createUrlShortener } from "../index.js";

// 1. Create a custom adapter for Redis
function createRedisStore(client) {
  return {
    async set(key, value) {
      // In Redis, values must be strings, so we convert the object to JSON
      await client.set(key, JSON.stringify(value));
    },

    async get(key) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    },

    async has(key) {
      const exists = await client.exists(key);
      return exists === 1;
    },

    async delete(key) {
      await client.del(key);
    },

    async update(key, updateFn) {
      // In Redis, we also need to read the value, parse it, update it, and set it again
      const data = await this.get(key);
      if (data) {
        const updatedData = updateFn(data);
        await this.set(key, updatedData);
      }
    },
  };
}

async function run() {
  const client = createClient({ url: "redis://localhost:6379" });
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();
  console.log("Connected to Redis");

  // 2. Inject the adapter into the package
  const shortener = createUrlShortener({
    storage: createRedisStore(client),
  });

  // 3. Standard package usage
  const code = await shortener.shorten("https://redis.io/docs", "redis-docs");
  console.log("Shortened Code:", code);

  const url = await shortener.resolve("redis-docs");
  console.log("Resolved URL:", url);

  await client.disconnect();
}

run().catch(console.error);
