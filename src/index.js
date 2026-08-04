import { validateUrl } from "./utils/validateUrl.js";
import { generateCode } from "./utils/generateCode.js";
import { createMemoryStore } from "./stores/memoryStore.js";

export function createUrlShortener() {
  const store = createMemoryStore();
  async function shorten(originalUrl, customAlias = null) {
    if (!validateUrl(originalUrl)) {
      throw new Error("URL is not valid.");
    }

    let shortCode = customAlias ? customAlias : generateCode();

    if (store.has(shortCode)) {
      throw new Error("short code already exists.");
    }

    store.set(shortCode, {
      originalUrl,
      shortCode,
      createdAt: new Date(),
    });

    return shortCode;
  }

  return {
    shorten,
  };
}
