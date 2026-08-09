import { validateUrl } from "./utils/validateUrl.js";
import { generateCode } from "./utils/generateCode.js";
import { createMemoryStore } from "./stores/memoryStore.js";
import { hashPassword } from "./utils/hashPassword.js";

export function createUrlShortener() {
  const store = createMemoryStore();
  async function shorten(originalUrl, customAlias = null, options = {}) {
    if (!validateUrl(originalUrl)) {
      throw new Error("URL is not valid.");
    }

    let shortCode = customAlias ? customAlias : generateCode();

    if (store.has(shortCode)) {
      throw new Error("short code already exists.");
    }

    const { expiresAt, maxClicks, password } = options;

    store.set(shortCode, {
      originalUrl,
      shortCode,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxClicks: maxClicks || null,
      currentClicks: 0,
      passwordHash: password ? hashPassword(password) : null,
      analytics: {
        clicks: 0,
        visitors: [],
      },
    });

    return shortCode;
  }

  async function resolve(shortCode) {
    const record = store.get(shortCode);

    if (!record) {
      throw new Error("short url not found!");
    }

    return record;
  }

  return {
    shorten,
    resolve,
  };
}
