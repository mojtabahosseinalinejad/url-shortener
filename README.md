# js-url-shortener

A zero-dependency, pure JavaScript URL shortener library.
No classes. No external packages. Just factory functions and native `Map`.

## Features

- Shorten URLs with random 6-char codes or custom aliases
- Resolve short codes back to original URLs
- **Expiration:** Set an `expiresAt` date/time
- **Click Limit:** Lock a link after `maxClicks`
- **Password Protection:** Protect links with a hashed password (API only)
- **Analytics:** Track total clicks, per-visit IP and User-Agent
- Built-in URL validation using native `URL`
- In-memory storage (isolated per instance)
- Pure ESM — works with `import/export`

## Installation

```bash
npm install js-url-shortener
```

## Usage

```javascript
import { createUrlShortener } from "js-url-shortener";

const sh = createUrlShortener();

(async () => {
  // 1) Basic shorten
  const code = await sh.shorten("https://google.com/search?q=test");
  console.log(code); // e.g., "aB3dEf"

  // 2) Custom alias
  const alias = await sh.shorten("https://github.com", "gh");
  console.log(alias); // "gh"

  // 3) Resolve
  const original = await sh.resolve("gh");
  console.log(original); // "https://github.com"

  // 4) Advanced: expiration + click limit + password
  const secret = await sh.shorten("https://secret.com", "s1", {
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    maxClicks: 5,
    password: "mypass123"
  });

  // 5) Resolve protected link with analytics tracking
  const url = await sh.resolve("s1", {
    password: "mypass123",
    ip: "192.168.1.5",
    userAgent: "Mozilla/5.0"
  });
  console.log(url); // "https://secret.com"

  // 6) Get analytics/stats
  const stats = await sh.getStats("s1");
  console.log(stats.analytics); // { clicks: 1, visitors: [{ ip, userAgent, timestamp }] }
})();
```

## API

### `createUrlShortener()`

Creates a new instance with its own private memory store.

Returns an object with:
- `shorten(originalUrl, customAlias?, options?)`
- `resolve(shortCode, resolveOptions?)`
- `getStats(shortCode)`

---

### `shorten(originalUrl, customAlias?, options?)`

- `originalUrl`: Must be a valid `http://` or `https://` URL.
- `customAlias`: Optional custom short code.
- `options` (optional object):
  - `expiresAt`: `Date` or ISO string. Link becomes invalid after this time.
  - `maxClicks`: `number`. Link blocked after this many resolves.
  - `password`: `string`. Hashed internally with SHA-256; never stored raw.

Throws:
- `URL is not valid.`
- `short code already exists.`
- `Link has expired.` (on resolve, not shorten)

---

### `resolve(shortCode, resolveOptions?)`

Returns the original URL.

- `resolveOptions` (optional object):
  - `password`: Required if the link was created with a `password`.
  - `ip`: Optional visitor IP recorded in analytics.
  - `userAgent`: Optional User-Agent recorded in analytics.

Behavior checks (in order):
1. Link must exist.
2. Must not be expired.
3. Must not have exceeded `maxClicks`.
4. If `password` was set, must provide correct `resolveOptions.password`.

Throws:
- `short url not found!`
- `this link has expired.`
- `The click limit for this link has expired.`
- `This link requires a password.` / `The password is incorrect.`

On success, increments `currentClicks` and pushes a new visitor record into `analytics.visitors`.

---

### `getStats(shortCode)`

Returns statistics for a link. Does **not** expose the password hash.

Returns:
```javascript
{
  originalUrl: "...",
  shortCode: "...",
  createdAt: Date,
  expiresAt: Date | null,
  maxClicks: number | null,
  currentClicks: number,
  analytics: {
    clicks: number,
    visitors: [
      { ip: "...", userAgent: "...", timestamp: Date }
    ]
  }
}
```

Throws:
- `short url not found!`

---

## Important Notes

- **Storage is temporary:** We use a native `Map()` inside the factory. If your process restarts, all links disappear. This package is perfect for learning, testing, or building a persistent adapter (Mongo, Redis) around it.
- **Password security:** Passwords are hashed using Node's native `crypto.createHash('sha256')`. The raw password is never stored in memory or returned by `getStats`.
- **ES Modules:** Requires Node.js with ESM support (`"type": "module"`).

## License

MIT
