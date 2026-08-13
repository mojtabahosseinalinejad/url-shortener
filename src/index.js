import { validateUrl } from "./utils/validateUrl.js";
import { generateCode } from "./utils/generateCode.js";
import { createMemoryStore } from "./stores/memoryStore.js";
import { hashPassword } from "./utils/hashPassword.js";
import {
  invalidUrlError,
  duplicateCodeError,
  shortLinkNotFoundError,
  expiredLinkError,
  clickLimitReachedError,
  passwordRequiredError,
  invalidPasswordError,
} from "./errors.js";

export function createUrlShortener(options = {}) {
  const store = options.storage || createMemoryStore();
  const codeGenerator = options.codeGenerator || (() => generateCode());

  async function shorten(originalUrl, customAlias = null, options = {}) {
    if (!validateUrl(originalUrl)) {
      throw invalidUrlError(originalUrl);
    }

    let shortCode = customAlias ? customAlias : codeGenerator();

    if (await store.has(shortCode)) {
      throw duplicateCodeError(shortCode);
    }

    const { expiresAt, maxClicks, password } = options;

    await store.set(shortCode, {
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
    const record = await store.get(shortCode);

    if (!record) {
      throw shortLinkNotFoundError(shortCode);
    }

    if (record.expiresAt && new Date() > record.expiresAt) {
      throw expiredLinkError(shortCode, record.expiresAt);
    }

    if (record.maxClicks && record.currentClicks >= record.maxClicks) {
      throw clickLimitReachedError(shortCode, record.maxClicks);
    }

    if (record.passwordHash) {
      const providedPassword = resolveOptions.password;
      if (!providedPassword) {
        throw passwordRequiredError(shortCode);
      }
      if (hashPassword(providedPassword) !== record.passwordHash) {
        throw invalidPasswordError(shortCode);
      }
    }

    await store.update(shortCode, (data) => {
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
    const record = await store.get(shortCode);

    if (!record) {
      throw shortLinkNotFoundError(shortCode);
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
