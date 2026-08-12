import { validateUrl } from "./utils/validateUrl.js";
import { generateCode } from "./utils/generateCode.js";
import { createMemoryStore } from "./stores/memoryStore.js";
import { hashPassword } from "./utils/hashPassword.js";

export function createUrlShortener(options = {}) {
  const store = options.storage || createMemoryStore();
  const codeGenerator = options.codeGenerator || (() => generateCode());

  async function shorten(originalUrl, customAlias = null, options = {}) {
    if (!validateUrl(originalUrl)) {
      throw new Error("URL is not valid.");
    }

    let shortCode = customAlias ? customAlias : codeGenerator();

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

  async function resolve(shortCode, resolveOptions = {}) {
    const record = store.get(shortCode);

    if (!record) {
      throw new Error("short url not found!");
    }

    if (record.expiresAt && new Date() > record.expiresAt) {
      throw new Error("this link has expired.");
    }

    if (record.maxClicks && record.currentClicks >= record.maxClicks) {
      throw new Error("The click limit for this link has expired.");
    }

    if (record.passwordHash) {
      const providedPassword = resolveOptions.password;
      if (!providedPassword) {
        throw new Error("This link requires a password.");
      }
      if (hashPassword(providedPassword) !== record.passwordHash) {
        throw new Error("The password is incorrect.");
      }
    }

    store.update(shortCode, (data) => {
      data.currentClicks++;
      data.analytics.clicks++;

      const visitorInfo = {
        ip: resolveOptions.ip || "unknown",
        userAgent: resolveOptions.userAgent || "unknown",
        timestamp: new Date(),
      };
      data.analytics.visitors.push(visitorInfo);

      return data;
    });

    return record.originalUrl;
  }

  async function getStats(shortCode) {
    const record = store.get(shortCode);

    if (!record) {
      throw new Error("short url not found!");
    }

    return {
      originalUrl: record.originalUrl,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      maxClicks: record.maxClicks,
      currentClicks: record.currentClicks,
      analytics: record.analytics,
    };
  }

  return {
    shorten,
    resolve,
    getStats,
  };
}
