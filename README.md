# js-url-shortener

A zero-dependency, pure JavaScript URL shortener library.
No classes. No external packages. Just factory functions and pluggable adapters.

## Features

- Shorten URLs with random codes or custom aliases
- Resolve short codes back to original URLs
- **Pluggable storage:** Bring your own database (MongoDB, Redis, Postgres...)
- **Custom ID strategy:** Inject your own short-code generator
- **Expiration:** Invalidate links after a given date
- **Click limits:** Lock a link after N resolves
- **Password protection:** API-level password gating
- **Analytics:** Track clicks, IP, and User-Agent
- Built-in URL validation using native `URL`
- Pure ESM — works with `import/export`

## Requirements

- Node.js 16+ (ESM support required)

## Installation

```bash
npm install js-url-shortener
```

## Quick Start

```javascript
import { createUrlShortener } from "js-url-shortener";

const sh = createUrlShortener();

const code = await sh.shorten("https://google.com/search?q=test");
console.log(code); // "aB3dEf"

const original = await sh.resolve(code);
console.log(original); // "https://google.com/search?q=test"
```

## Advanced Usage

```javascript
// Create a protected, expiring, click-limited link
await sh.shorten("https://secret.com", "s1", {
  expiresAt: new Date(Date.now() + 3600000), // 1 hour
  maxClicks: 5,
  password: "mypass123",
});

// Resolve it and record analytics
const url = await sh.resolve("s1", {
  password: "mypass123",
  ip: "192.168.1.5",
  userAgent: "Mozilla/5.0",
});

// Inspect stats
const stats = await sh.getStats("s1");
console.log(stats.analytics.clicks); // 1
console.log(stats.analytics.visitors); // [{ ip, userAgent, timestamp }]
```

---

## API

### `createUrlShortener(options?)`

Creates a new shortener instance.

| Option          | Type           | Default               | Description                        |
| --------------- | -------------- | --------------------- | ---------------------------------- |
| `storage`       | `object`       | In-memory `Map` store | Custom storage adapter (see below) |
| `codeGenerator` | `() => string` | 6-char alphanumeric   | Custom short-code generator        |

Returns: `{ shorten, resolve, getStats }`

---

### `shorten(originalUrl, customAlias?, options?)`

Returns `Promise<string>` — the short code.

- `originalUrl` — must be a valid `http://` or `https://` URL
- `customAlias` — optional custom code (skips the generator)
- `options.expiresAt` — `Date` or ISO string
- `options.maxClicks` — `number`
- `options.password` — `string` (hashed before storage)

Throws if the URL is invalid or the code already exists.

---

### `resolve(shortCode, resolveOptions?)`

Returns `Promise<string>` — the original URL.

- `resolveOptions.password` — required if the link is protected
- `resolveOptions.ip` — recorded in analytics (default `"unknown"`)
- `resolveOptions.userAgent` — recorded in analytics (default `"unknown"`)

Validation order: existence → expiration → click limit → password.
On success, increments the click counter and appends a visitor record.

---

### `getStats(shortCode)`

Returns metadata and analytics. **The password hash is never exposed.**

```javascript
{
  originalUrl: string,
  createdAt: Date,
  expiresAt: Date | null,
  maxClicks: number | null,
  currentClicks: number,
  analytics: {
    clicks: number,
    visitors: [{ ip, userAgent, timestamp }]
  }
}
```

---

## Storage Adapters

The default store is in-memory and **resets when your process restarts**.
For production, inject your own adapter. All methods may be sync or `async` — the core always `await`s them.

```javascript
const myStore = {
  async set(key, value) {
    /* save record */
  },
  async get(key) {
    /* return record or null */
  },
  async has(key) {
    /* return boolean */
  },
  async update(key, updateFn) {
    // read current, pass to updateFn, save the returned value
  },
  async delete(key) {
    /* reserved for future use */
  },
};

const sh = createUrlShortener({ storage: myStore });
```

> `delete` is not currently called by the core, but implementing it is recommended for forward compatibility.

Ready-to-use adapters live in the [`examples/`](./examples) folder:

- [MongoDB](https://github.com/mojtabahosseinalinejad/url-shortener/blob/main/examples/mongodb.js)
- [Redis](https://github.com/mojtabahosseinalinejad/url-shortener/blob/main/examples/redis.js)
- [PostgreSQL](https://github.com/mojtabahosseinalinejad/url-shortener/blob/main/examples/postgresql.js)

---

## Custom Code Generator

```javascript
import crypto from "crypto";

const sh = createUrlShortener({
  codeGenerator: () => crypto.randomUUID().split("-")[0],
});
```

Any function returning a string works — `nanoid`, `hashids`, base62 counters, etc.

---

## Security Notes

- **Passwords use unsalted SHA-256.** This is enough to avoid storing plaintext, but it is **not** suitable for high-value secrets. For sensitive use cases, hash the password yourself with `bcrypt`/`argon2` before it reaches this library, or treat the feature as a simple access gate.
- Password checking is not constant-time and may be vulnerable to timing attacks under adversarial conditions.
- Analytics store raw IPs — make sure this complies with your privacy policy (GDPR etc.).

---

## Contributing

Issues and PRs are welcome at the [GitHub repository](https://github.com/mojtabahosseinalinejad/url-shortener.git).

## License

MIT
