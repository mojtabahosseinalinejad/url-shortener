/**
 * Example of using js-url-shortener with PostgreSQL
 *
 * To run this example, first install the required package:
 * npm install pg
 *
 * You need a running PostgreSQL server.
 * First, run this query in your database to create the table:
 *
 * CREATE TABLE short_links (
 *   short_code VARCHAR(50) PRIMARY KEY,
 *   data JSONB NOT NULL
 * );
 */

import { Pool } from "pg";
import { createUrlShortener } from "../index.js";

// 1. Create a custom adapter for PostgreSQL
function createPostgresStore(pool) {
  return {
    async set(key, value) {
      // Using JSONB to store data
      await pool.query(
        "INSERT INTO short_links (short_code, data) VALUES ($1, $2) ON CONFLICT (short_code) DO UPDATE SET data = $2",
        [key, JSON.stringify(value)],
      );
    },

    async get(key) {
      const res = await pool.query(
        "SELECT data FROM short_links WHERE short_code = $1",
        [key],
      );
      return res.rows.length > 0 ? res.rows[0].data : null;
    },

    async has(key) {
      const res = await pool.query(
        "SELECT 1 FROM short_links WHERE short_code = $1",
        [key],
      );
      return res.rowCount > 0;
    },

    async delete(key) {
      await pool.query("DELETE FROM short_links WHERE short_code = $1", [key]);
    },

    async update(key, updateFn) {
      // In Postgres, we also read first, update, then save
      const current = await this.get(key);
      if (current) {
        const updatedData = updateFn(current);
        await this.set(key, updatedData);
      }
    },
  };
}

async function run() {
  const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "url_shortener_db",
    password: "your_password",
    port: 5432,
  });
  console.log("Connected to PostgreSQL");

  // 2. Inject the adapter into the package
  const shortener = createUrlShortener({
    storage: createPostgresStore(pool),
  });

  // 3. Standard package usage
  const code = await shortener.shorten(
    "https://postgresql.org/docs",
    "pg-docs",
  );
  console.log("Shortened Code:", code);

  const url = await shortener.resolve("pg-docs");
  console.log("Resolved URL:", url);

  await pool.end();
}

run().catch(console.error);
