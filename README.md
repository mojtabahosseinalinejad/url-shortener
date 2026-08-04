# js-url-shortener

A zero-dependency, pure JavaScript URL shortener library.
No classes. No external packages. Just factory functions and native `Map`.

## Features

- Shorten URLs with random 6-char codes or custom aliases
- Resolve short codes back to original URLs
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
  // 1) Shorten with random code
  const code = await sh.shorten("https://google.com/search?q=test");
  console.log(code); // e.g., "aB3dEf"

  // 2) Shorten with custom alias
  const alias = await sh.shorten("https://github.com", "gh");
  console.log(alias); // "gh"

  // 3) Resolve back to original
  const original = await sh.resolve("gh");
  console.log(original); // "https://github.com"
})();
```

## API

### `createUrlShortener()`

Creates a new instance with its own private memory store.

Returns an object with:

- `shorten(originalUrl, customAlias?)` → `Promise<string>`
- `resolve(shortCode)` → `Promise<string>`

### `shorten(originalUrl, customAlias?)`

- `originalUrl`: Must be a valid `http://` or `https://` URL.
- `customAlias`: Optional custom short code.

Throws:

- `URL is not valid.`
- `short code already exists.`

### `resolve(shortCode)`

Returns the original URL.

Throws:

- `short url not found!`

## Important Notes

- **Storage is temporary:** We use a native `Map()` inside the factory. If your process restarts, all links disappear. This package is perfect for learning, testing, or building a persistent adapter (Mongo, Redis) around it.
- **ES Modules:** Requires Node.js with ESM support (`"type": "module"`).

## License

MIT
