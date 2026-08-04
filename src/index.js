import { validateUrl } from "./utils/validateUrl";
import { generateCode } from "./utils/generateCode";
import { createMemoryStore } from "./stores/memoryStore";

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
}
